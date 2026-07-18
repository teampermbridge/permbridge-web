import { Router, Response } from 'express';
import { query } from '../db.js';
import { AuthRequest, authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard/org/:orgId - Get org dashboard stats
router.get('/org/:orgId', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;

  try {
    // Get profile count
    const profileResult = await query(
      `SELECT COUNT(*) as count FROM profiles WHERE organization_id = $1`,
      [orgId]
    );

    // Get permission set count
    const permsetResult = await query(
      `SELECT COUNT(*) as count FROM permission_sets WHERE organization_id = $1`,
      [orgId]
    );

    // Get user count
    const userResult = await query(
      `SELECT COUNT(*) as count FROM salesforce_users WHERE organization_id = $1`,
      [orgId]
    );

    // Get object permission count
    const objPermResult = await query(
      `SELECT COUNT(*) as count FROM object_permissions WHERE organization_id = $1`,
      [orgId]
    );

    // Get last sync time
    const syncResult = await query(
      `SELECT last_synced_at FROM salesforce_connections
       WHERE organization_id = $1 AND is_primary = true
       ORDER BY last_synced_at DESC LIMIT 1`,
      [orgId]
    );

    res.json({
      profiles: parseInt(profileResult.rows[0]?.count || 0),
      permissionSets: parseInt(permsetResult.rows[0]?.count || 0),
      users: parseInt(userResult.rows[0]?.count || 0),
      objectPermissions: parseInt(objPermResult.rows[0]?.count || 0),
      lastSyncedAt: syncResult.rows[0]?.last_synced_at || null,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

export default router;
