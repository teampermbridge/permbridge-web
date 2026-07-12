import { Router, Response } from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getAuthorizationUrl } from '../services/salesforceService.js';

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

export default router;
