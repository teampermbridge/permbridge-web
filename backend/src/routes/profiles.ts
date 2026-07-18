import { Router, Response } from 'express';
import { query } from '../db.js';
import { createConnection, getProfiles, getProfilePermissions } from '../services/salesforceService.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all profiles (fetch from Salesforce and cache)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    // Check if cache is fresh (less than 1 hour old)
    const cacheResult = await query(
      `SELECT id, salesforce_profile_id, name, description, permissions_count, last_synced_at
       FROM profiles
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
    const sfProfiles = await getProfiles(conn);

    // Update cache
    for (const profile of sfProfiles) {
      await query(
        `INSERT INTO profiles (user_id, salesforce_profile_id, name, description, last_synced_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id, salesforce_profile_id)
         DO UPDATE SET name = $3, description = $4, last_synced_at = NOW()`,
        [req.userId, profile.Id, profile.Name, profile.Description]
      );
    }

    // Return fresh data
    const result = await query(
      `SELECT id, salesforce_profile_id, name, description, permissions_count, last_synced_at
       FROM profiles
       WHERE user_id = $1
       ORDER BY name`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Get specific profile with permissions
router.get('/:profileId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { profileId } = req.params;
    const user = req.user;

    // Get profile from cache
    const profileResult = await query(
      `SELECT id, salesforce_profile_id, name, description, permissions_count, last_synced_at
       FROM profiles
       WHERE id = $1 AND user_id = $2`,
      [profileId, req.userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = profileResult.rows[0];

    // Check if permissions cache is fresh
    const isCacheFresh = profile.last_synced_at &&
      new Date(profile.last_synced_at) > new Date(Date.now() - 3600000); // 1 hour

    if (isCacheFresh) {
      // Return profile with basic info
      // In a more complete implementation, store permissions in DB too
      return res.json(profile);
    }

    // Fetch permissions from Salesforce
    const conn = createConnection(user.access_token, user.instance_url);
    const permissions = await getProfilePermissions(conn, profile.salesforce_profile_id);

    // Update cache with permission count
    const permCount = permissions.objectPermissions.length;
    await query(
      `UPDATE profiles
       SET permissions_count = $1, last_synced_at = NOW()
       WHERE id = $2`,
      [permCount, profileId]
    );

    res.json({
      ...profile,
      permissions_count: permCount,
      objectPermissions: permissions.objectPermissions,
      fieldPermissions: permissions.fieldPermissions,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Analyze profile (prepare for conversion to permsets)
router.post('/:profileId/analyze', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { profileId } = req.params;
    const user = req.user;

    // Get profile
    const profileResult = await query(
      'SELECT id, salesforce_profile_id, name FROM profiles WHERE id = $1 AND user_id = $2',
      [profileId, req.userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = profileResult.rows[0];

    // Fetch permissions from Salesforce
    const conn = createConnection(user.access_token, user.instance_url);
    const permissions = await getProfilePermissions(conn, profile.salesforce_profile_id);

    // Group permissions by object for easy viewing
    const objectMap = new Map();
    permissions.objectPermissions.forEach((perm: any) => {
      if (!objectMap.has(perm.SobjectType)) {
        objectMap.set(perm.SobjectType, []);
      }
      objectMap.get(perm.SobjectType).push({
        id: perm.Id,
        create: perm.PermissionsCreate,
        read: perm.PermissionsRead,
        edit: perm.PermissionsEdit,
        delete: perm.PermissionsDelete,
      });
    });

    res.json({
      profileId: profile.id,
      profileName: profile.name,
      objectCount: objectMap.size,
      permissionCount: permissions.objectPermissions.length,
      objects: Array.from(objectMap.entries()).map(([name, perms]) => ({
        name,
        permissions: perms,
      })),
      fieldPermissions: permissions.fieldPermissions,
    });
  } catch (error) {
    console.error('Analyze profile error:', error);
    res.status(500).json({ error: 'Failed to analyze profile' });
  }
});

export default router;
