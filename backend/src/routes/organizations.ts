import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ============ Organization CRUD ============

// List user's organizations
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT o.id, o.name, o.slug, o.tier, o.created_at,
              (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) as member_count
       FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('List organizations error:', error);
    res.status(500).json({ error: 'Failed to list organizations' });
  }
});

// Get organization details
router.get('/:orgId', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;

  try {
    // Check user has access
    const accessCheck = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(
      'SELECT id, name, slug, description, tier, subscription_status FROM organizations WHERE id = $1',
      [orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to get organization' });
  }
});

// Create organization
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Organization name required' });
  }

  try {
    const orgId = uuidv4();
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    await query('BEGIN');

    // Create organization
    await query(
      `INSERT INTO organizations (id, name, slug, description, owner_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [orgId, name, slug, description || null, req.userId]
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

    await query('COMMIT');

    res.status(201).json({
      id: orgId,
      name,
      slug,
      description,
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// Update organization
router.patch('/:orgId', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;
  const { name, description } = req.body;

  try {
    // Check user is owner or admin
    const roleResult = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (roleResult.rows.length === 0 || !['owner', 'admin'].includes(roleResult.rows[0].role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query(
      `UPDATE organizations
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE id = $3`,
      [name || null, description || null, orgId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

// ============ Team Members ============

// List team members
router.get('/:orgId/members', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;

  try {
    // Check user has access
    const accessCheck = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(
      `SELECT om.id, u.id as user_id, u.email, u.full_name, u.avatar_url, om.role, om.joined_at
       FROM organization_members om
       JOIN users u ON om.user_id = u.id
       WHERE om.organization_id = $1
       ORDER BY om.joined_at DESC`,
      [orgId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('List members error:', error);
    res.status(500).json({ error: 'Failed to list members' });
  }
});

// Invite team member
router.post('/:orgId/members/invite', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role required' });
  }

  try {
    // Check user is owner or admin
    const roleResult = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (roleResult.rows.length === 0 || !['owner', 'admin'].includes(roleResult.rows[0].role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await query(
      `INSERT INTO invitations (organization_id, email, role, invited_by, token, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (organization_id, email)
       DO UPDATE SET token = $5, expires_at = $6`,
      [orgId, email, role, req.userId, token, expiresAt]
    );

    // TODO: Send email invitation

    res.json({
      email,
      role,
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to invite member' });
  }
});

// Remove team member
router.delete('/:orgId/members/:memberId', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId, memberId } = req.params;

  try {
    // Check user is owner or admin
    const roleResult = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (roleResult.rows.length === 0 || !['owner', 'admin'].includes(roleResult.rows[0].role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can't remove owner
    const memberToRemove = await query(
      `SELECT role FROM organization_members WHERE id = $1`,
      [memberId]
    );

    if (memberToRemove.rows[0].role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove owner' });
    }

    await query(
      `DELETE FROM organization_members WHERE id = $1 AND organization_id = $2`,
      [memberId, orgId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Update member role
router.patch('/:orgId/members/:memberId', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId, memberId } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role required' });
  }

  try {
    // Check user is owner or admin
    const roleResult = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (roleResult.rows.length === 0 || !['owner', 'admin'].includes(roleResult.rows[0].role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query(
      `UPDATE organization_members SET role = $1, updated_at = NOW()
       WHERE id = $2 AND organization_id = $3`,
      [role, memberId, orgId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// ============ Settings ============

// Get org settings
router.get('/:orgId/settings', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;

  try {
    const result = await query(
      'SELECT * FROM organization_settings WHERE organization_id = $1',
      [orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update org settings
router.patch('/:orgId/settings', authenticate, async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;
  const { auto_sync_profiles, sync_interval_hours, enable_audit_logging } = req.body;

  try {
    // Check user is admin or owner
    const roleResult = await query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );

    if (roleResult.rows.length === 0 || !['owner', 'admin'].includes(roleResult.rows[0].role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query(
      `UPDATE organization_settings
       SET auto_sync_profiles = COALESCE($1, auto_sync_profiles),
           sync_interval_hours = COALESCE($2, sync_interval_hours),
           enable_audit_logging = COALESCE($3, enable_audit_logging),
           updated_at = NOW()
       WHERE organization_id = $4`,
      [auto_sync_profiles, sync_interval_hours, enable_audit_logging, orgId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
