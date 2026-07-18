import { Router, Response } from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getAuthorizationUrl } from '../services/salesforceService.js';
import { syncSalesforceOrg } from '../services/syncService.js';

const router = Router();

// List Salesforce connections for organization
router.get('/:orgId/connections', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;

  try {
    // Check access
    const accessCheck = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(
      `SELECT id, name, salesforce_org_id, salesforce_instance_url, is_primary, last_synced_at
       FROM salesforce_connections
       WHERE organization_id = $1
       ORDER BY is_primary DESC, created_at DESC`,
      [orgId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('List connections error:', error);
    res.status(500).json({ error: 'Failed to list connections' });
  }
});

// Get OAuth URL for connecting Salesforce
router.get('/:orgId/connect-url', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;

  try {
    // Check access
    const accessCheck = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const authUrl = await getAuthorizationUrl();
    // Add org ID to state for callback
    const stateUrl = `${authUrl}&state=${orgId}`;

    res.json({ authUrl: stateUrl });
  } catch (error) {
    console.error('Get connect URL error:', error);
    res.status(500).json({ error: 'Failed to get connection URL' });
  }
});

// Update connection (set as primary, rename, etc)
router.patch('/:orgId/connections/:connId', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId, connId } = req.params;
  const { name, is_primary } = req.body;

  try {
    // Check access
    const accessCheck = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (is_primary) {
      // Unset other connections as primary
      await query(
        `UPDATE salesforce_connections SET is_primary = false
         WHERE organization_id = $1`,
        [orgId]
      );
    }

    await query(
      `UPDATE salesforce_connections
       SET name = COALESCE($1, name),
           is_primary = COALESCE($2, is_primary),
           updated_at = NOW()
       WHERE id = $3 AND organization_id = $4`,
      [name, is_primary, connId, orgId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update connection error:', error);
    res.status(500).json({ error: 'Failed to update connection' });
  }
});

// Delete connection
router.delete('/:orgId/connections/:connId', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId, connId } = req.params;

  try {
    // Check access
    const accessCheck = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can't delete if only connection
    const countResult = await query(
      `SELECT COUNT(*) as count FROM salesforce_connections WHERE organization_id = $1`,
      [orgId]
    );

    if (parseInt(countResult.rows[0].count) <= 1) {
      return res.status(400).json({ error: 'Cannot delete the only Salesforce connection' });
    }

    await query(
      `DELETE FROM salesforce_connections WHERE id = $1 AND organization_id = $2`,
      [connId, orgId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete connection error:', error);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
});

// GET /api/salesforce/org/:orgId/profiles - List all profiles
router.get('/org/:orgId/profiles', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;

  try {
    const result = await query(
      `SELECT id, salesforce_profile_id, name, description, user_count, object_permission_count
       FROM profiles
       WHERE organization_id = $1
       ORDER BY name ASC`,
      [orgId]
    );

    res.json({
      profiles: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Profiles list error:', error);
    res.status(500).json({ error: 'Failed to get profiles' });
  }
});

// GET /api/salesforce/org/:orgId/permsets - List all permission sets
router.get('/org/:orgId/permsets', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;

  try {
    const result = await query(
      `SELECT id, salesforce_permset_id, name, description, user_count, object_permission_count
       FROM permission_sets
       WHERE organization_id = $1
       ORDER BY name ASC`,
      [orgId]
    );

    res.json({
      permissionSets: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Permission sets list error:', error);
    res.status(500).json({ error: 'Failed to get permission sets' });
  }
});

// GET /api/salesforce/org/:orgId/profiles/:profileId/permissions - Get profile permissions
router.get('/org/:orgId/profiles/:profileId/permissions', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId, profileId } = req.params;

  try {
    const result = await query(
      `SELECT
        salesforce_object_name as "objectName",
        permissions_create as "create",
        permissions_read as "read",
        permissions_edit as "edit",
        permissions_delete as "delete",
        permissions_view_all as "viewAll",
        permissions_modify_all as "modifyAll"
       FROM object_permissions
       WHERE organization_id = $1
         AND parent_id = $2
         AND parent_type = 'Profile'
       ORDER BY salesforce_object_name ASC`,
      [orgId, profileId]
    );

    res.json({
      permissions: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Profile permissions error:', error);
    res.status(500).json({ error: 'Failed to get profile permissions' });
  }
});

// GET /api/salesforce/org/:orgId/permsets/:permsetId/permissions - Get permission set permissions
router.get('/org/:orgId/permsets/:permsetId/permissions', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId, permsetId } = req.params;

  try {
    const result = await query(
      `SELECT
        salesforce_object_name as "objectName",
        permissions_create as "create",
        permissions_read as "read",
        permissions_edit as "edit",
        permissions_delete as "delete",
        permissions_view_all as "viewAll",
        permissions_modify_all as "modifyAll"
       FROM object_permissions
       WHERE organization_id = $1
         AND parent_id = $2
         AND parent_type = 'PermissionSet'
       ORDER BY salesforce_object_name ASC`,
      [orgId, permsetId]
    );

    res.json({
      permissions: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Permission set permissions error:', error);
    res.status(500).json({ error: 'Failed to get permission set permissions' });
  }
});

// POST /api/salesforce/org/:orgId/sync - Manually trigger sync
router.post('/:orgId/sync', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;

  try {
    const accessCheck = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const connResult = await query(
      `SELECT id, access_token, salesforce_instance_url
       FROM salesforce_connections
       WHERE organization_id = $1 AND is_primary = true
       LIMIT 1`,
      [orgId]
    );

    if (connResult.rows.length === 0) {
      return res.status(404).json({ error: 'No Salesforce connection found' });
    }

    const conn = connResult.rows[0];
    syncSalesforceOrg(
      conn.id,
      conn.access_token,
      conn.salesforce_instance_url,
      orgId
    ).catch((error) => {
      console.error('Manual sync error:', error);
    });

    res.json({ message: 'Sync initiated' });
  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).json({ error: 'Failed to trigger sync' });
  }
});

export default router;
