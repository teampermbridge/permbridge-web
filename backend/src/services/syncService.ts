import * as jsforce from 'jsforce';
import { query } from '../db.js';
import { createConnection, refreshAccessToken } from './salesforceService.js';

interface SyncJob {
  jobId: string;
  connectionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total: number;
  error?: string;
}

type Connection = jsforce.Connection;

/**
 * Main sync orchestrator - fetches all permission data from Salesforce
 */
export async function syncSalesforceOrg(
  connectionId: string,
  accessToken: string,
  instanceUrl: string,
  organizationId: string
): Promise<SyncJob> {
  const jobId = crypto.randomUUID();

  try {
    console.log(`[Sync ${jobId}] Starting sync for connection ${connectionId}`);

    // Create sync job in database
    await createSyncJob(jobId, connectionId, organizationId, 'running');

    // Create jsforce connection
    const conn = createConnection(accessToken, instanceUrl);

    // Test connection
    await testConnection(conn);
    console.log(`[Sync ${jobId}] ✓ Connection successful`);

    // Sync profiles
    console.log(`[Sync ${jobId}] Fetching profiles...`);
    await syncProfiles(conn, connectionId, organizationId);
    await updateSyncJobProgress(jobId, 25);

    // Sync permission sets
    console.log(`[Sync ${jobId}] Fetching permission sets...`);
    await syncPermissionSets(conn, connectionId, organizationId);
    await updateSyncJobProgress(jobId, 50);

    // Sync object permissions for profiles
    console.log(`[Sync ${jobId}] Fetching object permissions...`);
    await syncObjectPermissions(conn, connectionId, organizationId);
    await updateSyncJobProgress(jobId, 75);

    // Sync field permissions
    console.log(`[Sync ${jobId}] Fetching field permissions...`);
    await syncFieldPermissions(conn, connectionId, organizationId);
    await updateSyncJobProgress(jobId, 90);

    // Sync salesforce users
    console.log(`[Sync ${jobId}] Fetching users...`);
    await syncSalesforceUsers(conn, connectionId, organizationId);
    await updateSyncJobProgress(jobId, 100);

    // Mark connection as synced
    await query(
      `UPDATE salesforce_connections
       SET last_synced_at = NOW(), sync_status = 'success', sync_error_message = NULL
       WHERE id = $1`,
      [connectionId]
    );

    console.log(`[Sync ${jobId}] ✓ Sync completed successfully`);

    return {
      jobId,
      connectionId,
      status: 'completed',
      progress: 100,
      total: 100,
    };
  } catch (error) {
    console.error(`[Sync ${jobId}] ✗ Sync failed:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Mark sync as failed
    await query(
      `UPDATE salesforce_connections
       SET sync_status = 'error', sync_error_message = $1
       WHERE id = $2`,
      [errorMessage, connectionId]
    );

    await query(
      `UPDATE sync_jobs SET status = 'failed', error_message = $1 WHERE id = $2`,
      [errorMessage, jobId]
    );

    throw error;
  }
}

/**
 * Test Salesforce connection
 */
async function testConnection(conn: Connection): Promise<void> {
  try {
    const identity = await conn.identity();
    if (!identity.user_id) {
      throw new Error('Failed to verify Salesforce connection');
    }
  } catch (error) {
    throw new Error(`Salesforce connection test failed: ${error}`);
  }
}

/**
 * Fetch and cache all Profiles
 */
async function syncProfiles(
  conn: Connection,
  connectionId: string,
  organizationId: string
): Promise<void> {
  try {
    const result = await conn.query<any>(
      "SELECT Id, Name, Description FROM Profile ORDER BY Name"
    );

    const profiles = result.records || [];
    console.log(`Found ${profiles.length} profiles`);

    for (const profile of profiles) {
      // Check if profile already exists
      const existing = await query(
        `SELECT id FROM profiles
         WHERE salesforce_connection_id = $1 AND salesforce_profile_id = $2`,
        [connectionId, profile.Id]
      );

      if (existing.rows.length === 0) {
        // Insert new profile
        await query(
          `INSERT INTO profiles (
            organization_id, salesforce_connection_id, salesforce_profile_id, name, description, last_synced_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())`,
          [organizationId, connectionId, profile.Id, profile.Name, profile.Description || null]
        );
      } else {
        // Update existing profile
        await query(
          `UPDATE profiles
           SET name = $1, description = $2, last_synced_at = NOW()
           WHERE salesforce_connection_id = $3 AND salesforce_profile_id = $4`,
          [profile.Name, profile.Description || null, connectionId, profile.Id]
        );
      }
    }

    console.log(`✓ Synced ${profiles.length} profiles`);
  } catch (error) {
    console.error('Profile sync error:', error);
    throw error;
  }
}

/**
 * Fetch and cache all Permission Sets
 */
async function syncPermissionSets(
  conn: Connection,
  connectionId: string,
  organizationId: string
): Promise<void> {
  try {
    const result = await conn.query<any>(
      "SELECT Id, Name, Description FROM PermissionSet WHERE IsOwnedByProfile = false ORDER BY Name"
    );

    const permsets = result.records || [];
    console.log(`Found ${permsets.length} permission sets`);

    for (const permset of permsets) {
      const existing = await query(
        `SELECT id FROM permission_sets
         WHERE salesforce_connection_id = $1 AND salesforce_permset_id = $2`,
        [connectionId, permset.Id]
      );

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO permission_sets (
            organization_id, salesforce_connection_id, salesforce_permset_id, name, description, last_synced_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())`,
          [organizationId, connectionId, permset.Id, permset.Name, permset.Description || null]
        );
      } else {
        await query(
          `UPDATE permission_sets
           SET name = $1, description = $2, last_synced_at = NOW()
           WHERE salesforce_connection_id = $3 AND salesforce_permset_id = $4`,
          [permset.Name, permset.Description || null, connectionId, permset.Id]
        );
      }
    }

    console.log(`✓ Synced ${permsets.length} permission sets`);
  } catch (error) {
    console.error('PermissionSet sync error:', error);
    throw error;
  }
}

/**
 * Fetch and cache Object Permissions (CRUD)
 */
async function syncObjectPermissions(
  conn: Connection,
  connectionId: string,
  organizationId: string
): Promise<void> {
  try {
    // Fetch object permissions for all profiles
    const profileResult = await conn.query<any>(
      `SELECT ParentId, SobjectType, PermissionsCreate, PermissionsRead,
              PermissionsEdit, PermissionsDelete, PermissionsViewAll, PermissionsModifyAll
       FROM ObjectPermission WHERE ParentId IN (SELECT Id FROM Profile)`
    );

    const profilePerms = profileResult.records || [];

    // Fetch object permissions for all permission sets
    const permsetResult = await conn.query<any>(
      `SELECT ParentId, SobjectType, PermissionsCreate, PermissionsRead,
              PermissionsEdit, PermissionsDelete, PermissionsViewAll, PermissionsModifyAll
       FROM ObjectPermission WHERE ParentId IN (SELECT Id FROM PermissionSet WHERE IsOwnedByProfile = false)`
    );

    const permsetPerms = permsetResult.records || [];
    const allPerms = [...profilePerms, ...permsetPerms];

    console.log(`Found ${allPerms.length} object permissions`);

    for (const perm of allPerms) {
      const parentType = profilePerms.some(p => p.ParentId === perm.ParentId) ? 'Profile' : 'PermissionSet';

      await query(
        `INSERT INTO object_permissions (
          organization_id, salesforce_connection_id, parent_id, parent_type,
          salesforce_object_name, permissions_create, permissions_read,
          permissions_edit, permissions_delete, permissions_view_all, permissions_modify_all
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (organization_id, salesforce_connection_id, parent_id, salesforce_object_name)
        DO UPDATE SET
          permissions_create = $6, permissions_read = $7, permissions_edit = $8,
          permissions_delete = $9, permissions_view_all = $10, permissions_modify_all = $11`,
        [
          organizationId, connectionId, perm.ParentId, parentType,
          perm.SobjectType, perm.PermissionsCreate || false, perm.PermissionsRead || false,
          perm.PermissionsEdit || false, perm.PermissionsDelete || false,
          perm.PermissionsViewAll || false, perm.PermissionsModifyAll || false,
        ]
      );
    }

    console.log(`✓ Synced ${allPerms.length} object permissions`);
  } catch (error) {
    console.error('Object permissions sync error:', error);
    throw error;
  }
}

/**
 * Fetch and cache Field Permissions (FLS)
 */
async function syncFieldPermissions(
  conn: Connection,
  connectionId: string,
  organizationId: string
): Promise<void> {
  try {
    // Fetch field permissions for profiles
    const profileResult = await conn.query<any>(
      `SELECT ParentId, SobjectType, Field, PermissionsEdit, PermissionsRead
       FROM FieldPermission WHERE ParentId IN (SELECT Id FROM Profile) LIMIT 10000`
    );

    const profilePerms = profileResult.records || [];

    // Fetch field permissions for permission sets
    const permsetResult = await conn.query<any>(
      `SELECT ParentId, SobjectType, Field, PermissionsEdit, PermissionsRead
       FROM FieldPermission WHERE ParentId IN (SELECT Id FROM PermissionSet WHERE IsOwnedByProfile = false) LIMIT 10000`
    );

    const permsetPerms = permsetResult.records || [];
    const allPerms = [...profilePerms, ...permsetPerms];

    console.log(`Found ${allPerms.length} field permissions`);

    for (const perm of allPerms) {
      const parentType = profilePerms.some(p => p.ParentId === perm.ParentId) ? 'Profile' : 'PermissionSet';

      await query(
        `INSERT INTO field_permissions (
          organization_id, salesforce_connection_id, parent_id, parent_type,
          salesforce_object_name, field_name, permissions_edit, permissions_read
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (organization_id, salesforce_connection_id, parent_id, salesforce_object_name, field_name)
        DO UPDATE SET permissions_edit = $7, permissions_read = $8`,
        [
          organizationId, connectionId, perm.ParentId, parentType,
          perm.SobjectType, perm.Field, perm.PermissionsEdit || false, perm.PermissionsRead || false,
        ]
      );
    }

    console.log(`✓ Synced ${allPerms.length} field permissions`);
  } catch (error) {
    console.error('Field permissions sync error:', error);
    throw error;
  }
}

/**
 * Fetch and cache Salesforce Users
 */
async function syncSalesforceUsers(
  conn: Connection,
  connectionId: string,
  organizationId: string
): Promise<void> {
  try {
    const result = await conn.query<any>(
      `SELECT Id, Username, Email, FirstName, LastName, ProfileId, Profile.Name, IsActive, LastLoginDate
       FROM User ORDER BY Username LIMIT 10000`
    );

    const users = result.records || [];
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      await query(
        `INSERT INTO salesforce_users (
          organization_id, salesforce_connection_id, salesforce_user_id, username,
          email, first_name, last_name, profile_id, profile_name, is_active, last_login
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (organization_id, salesforce_connection_id, salesforce_user_id)
        DO UPDATE SET
          username = $4, email = $5, first_name = $6, last_name = $7,
          profile_id = $8, profile_name = $9, is_active = $10, last_login = $11`,
        [
          organizationId, connectionId, user.Id, user.Username,
          user.Email, user.FirstName || null, user.LastName || null,
          user.ProfileId, user.Profile?.Name || null, user.IsActive, user.LastLoginDate || null,
        ]
      );
    }

    console.log(`✓ Synced ${users.length} users`);
  } catch (error) {
    console.error('Users sync error:', error);
    throw error;
  }
}

/**
 * Helper: Create sync job record
 */
async function createSyncJob(
  jobId: string,
  connectionId: string,
  organizationId: string,
  status: string
): Promise<void> {
  await query(
    `INSERT INTO sync_jobs (id, organization_id, salesforce_connection_id, job_type, status, started_at)
     VALUES ($1, $2, $3, 'full_sync', $4, NOW())`,
    [jobId, organizationId, connectionId, status]
  );
}

/**
 * Helper: Update sync job progress
 */
async function updateSyncJobProgress(jobId: string, progress: number): Promise<void> {
  await query(
    `UPDATE sync_jobs SET progress = $1 WHERE id = $2`,
    [progress, jobId]
  );
}

/**
 * Get sync job status
 */
export async function getSyncJobStatus(jobId: string): Promise<any> {
  const result = await query(
    `SELECT id, status, progress, error_message, started_at, completed_at FROM sync_jobs WHERE id = $1`,
    [jobId]
  );

  return result.rows[0] || null;
}
