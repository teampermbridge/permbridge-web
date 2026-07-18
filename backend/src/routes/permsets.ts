import { Router, Response } from 'express';
import { query } from '../db.js';
import { createConnection, getPermissionSets, getPermissionSetPermissions } from '../services/salesforceService.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all permission sets (fetch from Salesforce and cache)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    // Check if cache is fresh
    const cacheResult = await query(
      `SELECT id, salesforce_permset_id, name, description, permissions_count, last_synced_at
       FROM permission_sets
       WHERE user_id = $1
       AND last_synced_at > NOW() - INTERVAL '1 hour'
       ORDER BY name`,
      [req.userId]
    );

    if (cacheResult.rows.length > 0) {
      return res.json(cacheResult.rows);
    }

    // Cache is stale, fetch from Salesforce
    const conn = createConnection(user.access_token, user.instance_url);
    const sfPermsets = await getPermissionSets(conn);

    // Update cache
    for (const permset of sfPermsets) {
      await query(
        `INSERT INTO permission_sets (user_id, salesforce_permset_id, name, description, last_synced_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id, salesforce_permset_id)
         DO UPDATE SET name = $3, description = $4, last_synced_at = NOW()`,
        [req.userId, permset.Id, permset.Name, permset.Description]
      );
    }

    // Return fresh data
    const result = await query(
      `SELECT id, salesforce_permset_id, name, description, permissions_count, last_synced_at
       FROM permission_sets
       WHERE user_id = $1
       ORDER BY name`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get permission sets error:', error);
    res.status(500).json({ error: 'Failed to fetch permission sets' });
  }
});

// Get specific permission set with permissions
router.get('/:permsetId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { permsetId } = req.params;
    const user = req.user;

    // Get permset from cache
    const permsetResult = await query(
      `SELECT id, salesforce_permset_id, name, description, permissions_count, last_synced_at
       FROM permission_sets
       WHERE id = $1 AND user_id = $2`,
      [permsetId, req.userId]
    );

    if (permsetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Permission set not found' });
    }

    const permset = permsetResult.rows[0];

    // Check if permissions cache is fresh
    const isCacheFresh = permset.last_synced_at &&
      new Date(permset.last_synced_at) > new Date(Date.now() - 3600000); // 1 hour

    if (isCacheFresh) {
      return res.json(permset);
    }

    // Fetch permissions from Salesforce
    const conn = createConnection(user.access_token, user.instance_url);
    const permissions = await getPermissionSetPermissions(conn, permset.salesforce_permset_id);

    // Update cache with permission count
    const permCount = permissions.objectPermissions.length;
    await query(
      `UPDATE permission_sets
       SET permissions_count = $1, last_synced_at = NOW()
       WHERE id = $2`,
      [permCount, permsetId]
    );

    res.json({
      ...permset,
      permissions_count: permCount,
      objectPermissions: permissions.objectPermissions,
      fieldPermissions: permissions.fieldPermissions,
    });
  } catch (error) {
    console.error('Get permission set error:', error);
    res.status(500).json({ error: 'Failed to fetch permission set' });
  }
});

// Search permission sets by name or description
router.get('/search/:query', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { query: searchQuery } = req.params;

    const result = await query(
      `SELECT id, salesforce_permset_id, name, description, permissions_count, last_synced_at
       FROM permission_sets
       WHERE user_id = $1
       AND (LOWER(name) LIKE LOWER($2) OR LOWER(description) LIKE LOWER($2))
       ORDER BY name
       LIMIT 50`,
      [req.userId, `%${searchQuery}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
