import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { createToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  getAuthorizationUrl,
  exchangeCodeForToken,
  getUserInfo,
  refreshAccessToken,
} from '../services/salesforceService.js';
import { syncSalesforceOrg, getSyncJobStatus } from '../services/syncService.js';
import { AuthRequest, authenticate } from '../middleware/auth.js';

const router = Router();

// ============ OAuth Flow (Salesforce) ============

router.get('/salesforce/login', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.query.orgId as string;

    if (!orgId) {
      return res.status(400).json({ error: 'Missing organizationId' });
    }

    const { authUrl } = await getAuthorizationUrl(orgId, req.userId);

    res.json({ authUrl });
  } catch (error) {
    console.error('Salesforce login error:', error);
    res.status(500).json({ error: 'Failed to initiate Salesforce login' });
  }
});

router.get('/salesforce/callback', async (req: AuthRequest, res: Response) => {
  const { code, state, error: oauthError, error_description } = req.query;

  console.log('🔐 OAUTH CALLBACK: Received callback', { code: !!code, state: !!state, oauthError });

  // Handle OAuth errors from Salesforce
  if (oauthError) {
    console.error('🔐 OAUTH CALLBACK: Salesforce rejected OAuth', {
      error: oauthError,
      description: error_description
    });

    let errorMsg = 'Salesforce authentication failed. Please try again.';

    if (oauthError === 'access_denied') {
      errorMsg = 'You denied access. Connection cancelled.';
    } else if (oauthError?.toString().includes('mfa') || error_description?.toString().includes('MFA')) {
      errorMsg = 'MFA is required. Please set up phishing-resistant MFA in your Salesforce org (security key or passkey), then try connecting again.';
    } else if (oauthError === 'invalid_scope') {
      errorMsg = 'Salesforce app configuration error. Please contact support.';
    }

    const frontendUrl = process.env.NODE_ENV === 'production'
      ? 'https://permbridge.vercel.app'
      : 'http://localhost:5173';

    return res.redirect(`${frontendUrl}/connect?error=${encodeURIComponent(errorMsg)}`);
  }

  if (!code) {
    console.error('🔐 OAUTH CALLBACK: Missing authorization code');
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  if (!state) {
    console.error('🔐 OAUTH CALLBACK: Missing state parameter');
    return res.status(400).json({ error: 'Missing state parameter' });
  }

  try {
    // State contains: organizationId|pkceId
    const stateParts = (state as string).split('|');
    const organizationId = stateParts[0];
    const pkceId = stateParts[1];

    if (!organizationId || !pkceId) {
      console.error('🔐 OAUTH CALLBACK: Invalid state format', { stateParts });
      return res.status(400).json({ error: 'Invalid state format' });
    }

    console.log('🔐 OAUTH CALLBACK: Exchanging code for token', { organizationId });
    const tokenResponse = await exchangeCodeForToken(code as string, pkceId);
    console.log('🔐 OAUTH CALLBACK: Got token response, fetching user info');
    const userInfo = await getUserInfo(tokenResponse.access_token, tokenResponse.instance_url);

    console.log('🔐 OAUTH CALLBACK: Storing Salesforce connection', {
      organizationId,
      salesforceUserId: userInfo.id
    });

    // Store Salesforce connection in organization
    const result = await query(
      `INSERT INTO salesforce_connections (
        organization_id, user_id, salesforce_user_id, salesforce_org_id,
        salesforce_instance_url, access_token, refresh_token, token_expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (organization_id, salesforce_org_id)
      DO UPDATE SET access_token = $6, refresh_token = $7, token_expires_at = $8
      RETURNING id`,
      [
        organizationId,
        tokenResponse.userId,
        userInfo.id,
        userInfo.org_id,
        tokenResponse.instance_url,
        tokenResponse.access_token,
        tokenResponse.refresh_token || null,
        new Date(parseInt(tokenResponse.issued_at) + 3600000),
      ]
    );

    console.log('🔐 OAUTH CALLBACK: Connection stored, triggering background sync');

    // Trigger sync in background (don't wait for it)
    syncSalesforceOrg(
      result.rows[0].id,
      tokenResponse.access_token,
      tokenResponse.instance_url,
      organizationId
    ).catch((error) => {
      console.error('🔐 OAUTH CALLBACK: Background sync error:', error);
    });

    const frontendUrl = process.env.NODE_ENV === 'production'
      ? 'https://permbridge.vercel.app'
      : 'http://localhost:5173';

    console.log('🔐 OAUTH CALLBACK: Success! Redirecting to dashboard');
    res.redirect(`${frontendUrl}/dashboard?org=${organizationId}&salesforce_connected=true`);
  } catch (error: any) {
    console.error('🔐 OAUTH CALLBACK: Callback error:', error);
    console.error('🔐 OAUTH CALLBACK: Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join(' | ')
    });

    const frontendUrl = process.env.NODE_ENV === 'production'
      ? 'https://permbridge.vercel.app'
      : 'http://localhost:5173';

    const errorMsg = error.message?.includes('PKCE')
      ? 'PKCE verification failed. Please try connecting again.'
      : error.message?.includes('MFA')
      ? 'MFA setup required. Set up phishing-resistant MFA in Salesforce, then retry.'
      : 'Salesforce authentication failed. Please try again.';

    res.redirect(`${frontendUrl}/connect?error=${encodeURIComponent(errorMsg)}`);
  }
});

// ============ Email/Password Auth ============

router.post('/register', async (req: AuthRequest, res: Response) => {
  const { email, password, full_name, organization_name } = req.body;

  if (!email || !password || !organization_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create user
    const userId = uuidv4();
    const passwordHash = hashPassword(password);
    const orgSlug = organization_name.toLowerCase().replace(/\s+/g, '-');

    await query('BEGIN');

    // Insert user
    await query(
      `INSERT INTO users (id, email, full_name, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [userId, email, full_name, passwordHash]
    );

    // Create organization
    const orgId = uuidv4();
    await query(
      `INSERT INTO organizations (id, name, slug, owner_id)
       VALUES ($1, $2, $3, $4)`,
      [orgId, organization_name, orgSlug, userId]
    );

    // Add user as owner
    await query(
      `INSERT INTO organization_members (organization_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [orgId, userId]
    );

    // Create user settings
    await query(
      `INSERT INTO user_settings (user_id) VALUES ($1)`,
      [userId]
    );

    // Create org settings
    await query(
      `INSERT INTO organization_settings (organization_id) VALUES ($1)`,
      [orgId]
    );

    // Create subscription
    await query(
      `INSERT INTO subscriptions (organization_id, plan_id, status)
       VALUES ($1, 'free', 'active')`,
      [orgId]
    );

    await query('COMMIT');

    // Create JWT token
    const token = createToken(userId, email);

    res.json({
      token,
      user: {
        id: userId,
        email,
        full_name,
      },
      organization: {
        id: orgId,
        name: organization_name,
        slug: orgSlug,
      },
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Registration error:', error);
    if ((error as any).code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0 || !verifyPassword(password, result.rows[0].password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const token = createToken(user.id, user.email);

    // Get user's organizations
    const orgsResult = await query(
      `SELECT o.id, o.name, o.slug FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1`,
      [user.id]
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      organizations: orgsResult.rows,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============ User Info & Settings ============

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userResult = await query(
      `SELECT id, email, full_name, avatar_url, two_factor_enabled
       FROM users WHERE id = $1`,
      [req.userId]
    );

    const settingsResult = await query(
      'SELECT theme, notifications_email, locale, timezone FROM user_settings WHERE user_id = $1',
      [req.userId]
    );

    const orgsResult = await query(
      `SELECT o.id, o.name, o.slug FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: userResult.rows[0],
      settings: settingsResult.rows[0],
      organizations: orgsResult.rows,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

router.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Both passwords required' });
  }

  try {
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!verifyPassword(current_password, result.rows[0].password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = hashPassword(new_password);
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, req.userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Update last_login_at
    await query(
      'UPDATE users SET updated_at = NOW() WHERE id = $1',
      [req.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ============ Organization Management ============

router.post('/organizations', authenticate, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Organization name required' });
  }

  try {
    const orgSlug = name.toLowerCase().replace(/\s+/g, '-');

    // Create organization
    const orgId = uuidv4();
    await query(
      `INSERT INTO organizations (id, name, slug, owner_id)
       VALUES ($1, $2, $3, $4)`,
      [orgId, name, orgSlug, req.userId]
    );

    // Add user as owner
    await query(
      `INSERT INTO organization_members (organization_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [orgId, req.userId]
    );

    // Create org settings
    await query(
      `INSERT INTO organization_settings (organization_id) VALUES ($1)`,
      [orgId]
    );

    // Create subscription
    await query(
      `INSERT INTO subscriptions (organization_id, plan_id, status)
       VALUES ($1, 'free', 'active')`,
      [orgId]
    );

    res.json({
      id: orgId,
      name,
      slug: orgSlug,
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

router.delete('/organizations/:orgId', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;

  console.log(`🗑️ DELETE ORG: User ${req.userId} attempting to delete org ${orgId}`);

  try {
    // Verify user is owner
    const ownerCheck = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    console.log(`🗑️ DELETE ORG: Owner check result:`, ownerCheck.rows);

    if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].role !== 'owner') {
      console.log(`🗑️ DELETE ORG: Not owner - denying delete`);
      return res.status(403).json({ error: 'Only organization owner can delete it' });
    }

    console.log(`🗑️ DELETE ORG: User is owner, deleting org ${orgId}...`);

    // Delete organization (cascades to all related data)
    const deleteResult = await query('DELETE FROM organizations WHERE id = $1', [orgId]);

    console.log(`🗑️ DELETE ORG: Delete returned`, deleteResult);

    // Verify it's gone
    const verifyDelete = await query('SELECT id FROM organizations WHERE id = $1', [orgId]);
    console.log(`🗑️ DELETE ORG: Verification - org still exists?`, verifyDelete.rows.length > 0);

    res.json({ success: true });
  } catch (error) {
    console.error('🗑️ DELETE ORG: Error:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

// ============ Salesforce Sync ============

router.post('/salesforce/sync', authenticate, async (req: AuthRequest, res: Response) => {
  const { salesforceConnectionId, organizationId } = req.body;

  if (!salesforceConnectionId || !organizationId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get the Salesforce connection details
    const connResult = await query(
      `SELECT access_token, refresh_token, salesforce_instance_url, token_expires_at
       FROM salesforce_connections
       WHERE id = $1 AND organization_id = $2`,
      [salesforceConnectionId, organizationId]
    );

    if (connResult.rows.length === 0) {
      return res.status(404).json({ error: 'Salesforce connection not found' });
    }

    const conn = connResult.rows[0];
    let accessToken = conn.access_token;

    // Check if token needs refresh
    if (new Date(conn.token_expires_at) < new Date()) {
      console.log('Token expired, refreshing...');
      if (!conn.refresh_token) {
        return res.status(401).json({ error: 'Refresh token expired. Please reconnect.' });
      }

      try {
        const refreshed = await refreshAccessToken(conn.refresh_token, conn.salesforce_instance_url);
        accessToken = refreshed.access_token;

        // Update token in database
        await query(
          `UPDATE salesforce_connections
           SET access_token = $1, refresh_token = $2, token_expires_at = $3
           WHERE id = $4`,
          [
            refreshed.access_token,
            refreshed.refresh_token || conn.refresh_token,
            new Date(parseInt(refreshed.issued_at) + 3600000),
            salesforceConnectionId,
          ]
        );
      } catch (err) {
        return res.status(401).json({ error: 'Failed to refresh Salesforce token' });
      }
    }

    // Start sync in background (don't wait for it)
    console.log(`Starting sync for connection ${salesforceConnectionId}`);
    syncSalesforceOrg(
      salesforceConnectionId,
      accessToken,
      conn.salesforce_instance_url,
      organizationId
    ).catch((error) => {
      console.error('Background sync error:', error);
    });

    // Return immediately with job info
    res.json({
      success: true,
      message: 'Sync started in background',
      syncConnectionId: salesforceConnectionId,
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to start sync' });
  }
});

router.get('/salesforce/sync-status/:jobId', authenticate, async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;

  try {
    const status = await getSyncJobStatus(jobId);

    if (!status) {
      return res.status(404).json({ error: 'Sync job not found' });
    }

    res.json(status);
  } catch (error) {
    console.error('Sync status error:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

export default router;
