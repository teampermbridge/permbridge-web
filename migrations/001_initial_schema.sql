-- ============================================================================
-- PermBridge Initial Schema
-- Production-ready schema with proper indexing, constraints, and timestamps
-- ============================================================================

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- ORGANIZATIONS & MULTI-TENANCY
-- ============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);

-- ============================================================================
-- SALESFORCE CONNECTIONS
-- ============================================================================

CREATE TABLE salesforce_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salesforce_user_id VARCHAR(255) NOT NULL,
  salesforce_org_id VARCHAR(255) NOT NULL,
  salesforce_instance_url VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  is_primary BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'pending', -- pending, syncing, success, error
  sync_error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_org_id)
);

CREATE INDEX idx_sf_conn_org_id ON salesforce_connections(organization_id);
CREATE INDEX idx_sf_conn_user_id ON salesforce_connections(user_id);
CREATE INDEX idx_sf_conn_sf_org_id ON salesforce_connections(salesforce_org_id);
CREATE INDEX idx_sf_conn_sync_status ON salesforce_connections(sync_status);

-- ============================================================================
-- PROFILES (cached from Salesforce)
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  salesforce_profile_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_license_id VARCHAR(255),
  user_count INT DEFAULT 0,
  object_permission_count INT DEFAULT 0,
  field_permission_count INT DEFAULT 0,
  system_permission_count INT DEFAULT 0,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_connection_id, salesforce_profile_id)
);

CREATE INDEX idx_profiles_org_id ON profiles(organization_id);
CREATE INDEX idx_profiles_sf_conn_id ON profiles(salesforce_connection_id);
CREATE INDEX idx_profiles_name ON profiles(name);

-- ============================================================================
-- PERMISSION SETS
-- ============================================================================

CREATE TABLE permission_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  salesforce_permset_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'custom', -- custom, mfa, session
  user_count INT DEFAULT 0,
  object_permission_count INT DEFAULT 0,
  field_permission_count INT DEFAULT 0,
  system_permission_count INT DEFAULT 0,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_connection_id, salesforce_permset_id)
);

CREATE INDEX idx_permsets_org_id ON permission_sets(organization_id);
CREATE INDEX idx_permsets_sf_conn_id ON permission_sets(salesforce_connection_id);
CREATE INDEX idx_permsets_name ON permission_sets(name);
CREATE INDEX idx_permsets_type ON permission_sets(type);

-- ============================================================================
-- OBJECT PERMISSIONS (CRUD)
-- ============================================================================

CREATE TABLE object_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  parent_id VARCHAR(255) NOT NULL, -- Profile or PermSet ID from Salesforce
  parent_type VARCHAR(50) NOT NULL, -- 'Profile' or 'PermissionSet'
  salesforce_object_name VARCHAR(255) NOT NULL,
  permissions_create BOOLEAN DEFAULT false,
  permissions_read BOOLEAN DEFAULT false,
  permissions_edit BOOLEAN DEFAULT false,
  permissions_delete BOOLEAN DEFAULT false,
  permissions_view_all BOOLEAN DEFAULT false,
  permissions_modify_all BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_connection_id, parent_id, salesforce_object_name)
);

CREATE INDEX idx_obj_perms_org_id ON object_permissions(organization_id);
CREATE INDEX idx_obj_perms_sf_conn_id ON object_permissions(salesforce_connection_id);
CREATE INDEX idx_obj_perms_parent ON object_permissions(parent_id, parent_type);
CREATE INDEX idx_obj_perms_object ON object_permissions(salesforce_object_name);

-- ============================================================================
-- FIELD PERMISSIONS (FLS)
-- ============================================================================

CREATE TABLE field_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  parent_id VARCHAR(255) NOT NULL, -- Profile or PermSet ID from Salesforce
  parent_type VARCHAR(50) NOT NULL, -- 'Profile' or 'PermissionSet'
  salesforce_object_name VARCHAR(255) NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  permissions_edit BOOLEAN DEFAULT false,
  permissions_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_connection_id, parent_id, salesforce_object_name, field_name)
);

CREATE INDEX idx_field_perms_org_id ON field_permissions(organization_id);
CREATE INDEX idx_field_perms_sf_conn_id ON field_permissions(salesforce_connection_id);
CREATE INDEX idx_field_perms_parent ON field_permissions(parent_id, parent_type);
CREATE INDEX idx_field_perms_object_field ON field_permissions(salesforce_object_name, field_name);

-- ============================================================================
-- SYSTEM PERMISSIONS
-- ============================================================================

CREATE TABLE system_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  parent_id VARCHAR(255) NOT NULL, -- Profile or PermSet ID from Salesforce
  parent_type VARCHAR(50) NOT NULL, -- 'Profile' or 'PermissionSet'
  permission_name VARCHAR(255) NOT NULL,
  is_granted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_connection_id, parent_id, permission_name)
);

CREATE INDEX idx_sys_perms_org_id ON system_permissions(organization_id);
CREATE INDEX idx_sys_perms_sf_conn_id ON system_permissions(salesforce_connection_id);
CREATE INDEX idx_sys_perms_parent ON system_permissions(parent_id, parent_type);
CREATE INDEX idx_sys_perms_name ON system_permissions(permission_name);

-- ============================================================================
-- SALESFORCE USERS (cached)
-- ============================================================================

CREATE TABLE salesforce_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  salesforce_user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  profile_id VARCHAR(255),
  profile_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_connection_id, salesforce_user_id)
);

CREATE INDEX idx_sf_users_org_id ON salesforce_users(organization_id);
CREATE INDEX idx_sf_users_sf_conn_id ON salesforce_users(salesforce_connection_id);
CREATE INDEX idx_sf_users_email ON salesforce_users(email);
CREATE INDEX idx_sf_users_profile ON salesforce_users(profile_id);

-- ============================================================================
-- SALESFORCE USER PERMISSION SET ASSIGNMENTS
-- ============================================================================

CREATE TABLE user_permset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  salesforce_user_id VARCHAR(255) NOT NULL,
  salesforce_permset_id VARCHAR(255) NOT NULL,
  assigned_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_connection_id, salesforce_user_id, salesforce_permset_id)
);

CREATE INDEX idx_user_ps_assign_org_id ON user_permset_assignments(organization_id);
CREATE INDEX idx_user_ps_assign_sf_conn_id ON user_permset_assignments(salesforce_connection_id);
CREATE INDEX idx_user_ps_assign_user_id ON user_permset_assignments(salesforce_user_id);
CREATE INDEX idx_user_ps_assign_permset_id ON user_permset_assignments(salesforce_permset_id);

-- ============================================================================
-- USER SETTINGS
-- ============================================================================

CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'dark', -- dark, light
  notifications_email BOOLEAN DEFAULT true,
  locale VARCHAR(10) DEFAULT 'en-US',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- ============================================================================
-- ORGANIZATION SETTINGS
-- ============================================================================

CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_interval_hours INT DEFAULT 24,
  enable_audit_logs BOOLEAN DEFAULT true,
  enable_two_factor_enforcement BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_org_settings_org_id ON organization_settings(organization_id);

-- ============================================================================
-- SUBSCRIPTIONS & BILLING
-- ============================================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL DEFAULT 'free', -- free, starter, growth, enterprise
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL, -- created, updated, deleted, exported, etc.
  resource_type VARCHAR(255), -- profile, permset, user, etc.
  resource_id VARCHAR(255),
  changes JSONB, -- track what changed
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- API KEYS (for service-to-service auth)
-- ============================================================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- ============================================================================
-- CONVERTER RESULTS (for Profile → PermSet conversions)
-- ============================================================================

CREATE TABLE converter_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  source_profile_id VARCHAR(255) NOT NULL,
  source_profile_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, executed, rolled_back
  suggested_groupings JSONB NOT NULL, -- { grouping_name: [permissions] }
  created_permset_ids TEXT[], -- array of Salesforce PermSet IDs created
  created_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP,
  rolled_back_at TIMESTAMP
);

CREATE INDEX idx_converter_org_id ON converter_results(organization_id);
CREATE INDEX idx_converter_user_id ON converter_results(user_id);
CREATE INDEX idx_converter_status ON converter_results(status);
CREATE INDEX idx_converter_created_at ON converter_results(created_at);

-- ============================================================================
-- SYNC JOBS (track long-running sync operations)
-- ============================================================================

CREATE TABLE sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL, -- full_sync, incremental_sync, profile_sync, permset_sync
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  progress INT DEFAULT 0,
  total_items INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_org_id ON sync_jobs(organization_id);
CREATE INDEX idx_sync_jobs_sf_conn_id ON sync_jobs(salesforce_connection_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX idx_sync_jobs_created_at ON sync_jobs(created_at);
