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
import { AuthRequest, authenticate } from '../middleware/auth.js';

const router = Router();

// ============ OAuth Flow (Salesforce) ============

router.get('/salesforce/login', async (req: AuthRequest, res: Response) => {
  try {
    const authUrl = await getAuthorizationUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Salesforce login error:', error);
    res.status(500).json({ error: 'Failed to initiate Salesforce login' });
  }
});

router.get('/salesforce/callback', async (req: AuthRequest, res: Response) => {
  const { code } = req.query;
  const organizationId = req.query.state as string; // Pass org ID in state param

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code as string);
    const userInfo = await getUserInfo(tokenResponse.access_token, tokenResponse.instance_url);

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
        req.userId,
        userInfo.id,
        userInfo.org_id,
        tokenResponse.instance_url,
        tokenResponse.access_token,
        tokenResponse.refresh_token || null,
        new Date(parseInt(tokenResponse.issued_at) + 3600000),
      ]
    );

    const frontendUrl = process.env.NODE_ENV === 'production'
      ? 'https://permbridge.vercel.app'
      : 'http://localhost:5173';

    res.redirect(`${frontendUrl}/dashboard?org=${organizationId}&salesforce_connected=true`);
  } catch (error) {
    console.error('Salesforce callback error:', error);
    res.status(500).json({ error: 'Salesforce authentication failed' });
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

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: userResult.rows[0],
      settings: settingsResult.rows[0],
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

export default router;
