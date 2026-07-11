import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { createToken } from '../utils/jwt.js';
import {
  getAuthorizationUrl,
  exchangeCodeForToken,
  getUserInfo,
  refreshAccessToken,
} from '../services/salesforceService.js';
import { AuthRequest, authenticate } from '../middleware/auth.js';

const router = Router();

// Step 1: Initiate OAuth flow
router.get('/login', async (req: AuthRequest, res: Response) => {
  try {
    const authUrl = await getAuthorizationUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to initiate login' });
  }
});

// Step 2: Handle OAuth callback from Salesforce
router.get('/callback', async (req: AuthRequest, res: Response) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code as string);

    // Get user info from Salesforce
    const userInfo = await getUserInfo(
      tokenResponse.access_token,
      tokenResponse.instance_url
    );

    // Check if user exists
    let result = await query(
      'SELECT id FROM users WHERE salesforce_user_id = $1',
      [userInfo.id]
    );

    let userId: string;

    if (result.rows.length > 0) {
      // Update existing user
      userId = result.rows[0].id;
      await query(
        `UPDATE users
         SET access_token = $1, refresh_token = $2, token_expires_at = $3, updated_at = NOW()
         WHERE id = $4`,
        [
          tokenResponse.access_token,
          tokenResponse.refresh_token || null,
          new Date(parseInt(tokenResponse.issued_at) + 3600000), // 1 hour expiry
          userId,
        ]
      );
    } else {
      // Create new user
      userId = uuidv4();
      await query(
        `INSERT INTO users (
          id, salesforce_user_id, salesforce_org_id, email, name,
          access_token, refresh_token, token_expires_at, instance_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId,
          userInfo.id,
          userInfo.org_id,
          userInfo.email,
          userInfo.name,
          tokenResponse.access_token,
          tokenResponse.refresh_token || null,
          new Date(parseInt(tokenResponse.issued_at) + 3600000),
          tokenResponse.instance_url,
        ]
      );
    }

    // Create JWT token for frontend
    const jwtToken = createToken(userId, userInfo.email);

    // Redirect to frontend with token
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? 'https://permbridge.vercel.app'
      : 'http://localhost:5173';

    res.redirect(`${frontendUrl}/auth-success?token=${jwtToken}`);
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current user info
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      salesforceOrgId: req.user.salesforce_org_id,
      createdAt: req.user.created_at,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Refresh access token (internal use)
router.post('/refresh', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user.refresh_token) {
      return res.status(400).json({ error: 'No refresh token available' });
    }

    const newToken = await refreshAccessToken(
      req.user.refresh_token,
      req.user.instance_url
    );

    // Update database
    await query(
      `UPDATE users
       SET access_token = $1, token_expires_at = $2, updated_at = NOW()
       WHERE id = $3`,
      [
        newToken.access_token,
        new Date(parseInt(newToken.issued_at) + 3600000),
        req.userId,
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Token is invalidated by simply not using it anymore
    // In a more sophisticated system, add to a blacklist
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
