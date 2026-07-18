-- Drop old users table constraints for migration
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey CASCADE;

-- Recreate users table with SaaS fields
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100),
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Organizations (workspaces/teams)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(50) NOT NULL DEFAULT 'free', -- free, pro, enterprise
  subscription_status VARCHAR(50) DEFAULT 'active', -- active, paused, cancelled
  max_team_members INT DEFAULT 5,
  max_salesforce_orgs INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Organization members (team)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);

-- Salesforce connections (multi-org support)
CREATE TABLE IF NOT EXISTS salesforce_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salesforce_user_id VARCHAR(255) NOT NULL,
  salesforce_org_id VARCHAR(255) NOT NULL,
  salesforce_instance_url VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP NOT NULL,
  name VARCHAR(255), -- friendly name (e.g., "Production", "Sandbox")
  is_primary BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'pending', -- pending, running, success, error
  sync_error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_org_id)
);

CREATE INDEX idx_salesforce_connections_org_id ON salesforce_connections(organization_id);
CREATE INDEX idx_salesforce_connections_user_id ON salesforce_connections(user_id);
CREATE INDEX idx_salesforce_connections_primary ON salesforce_connections(organization_id, is_primary);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  plan_id VARCHAR(100), -- free, pro_monthly, pro_annual, enterprise
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, cancelled, past_due
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_customer_id);

-- Billing events (track usage, invoices, etc)
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- conversion_created, profile_analyzed, export_generated
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_billing_events_org_id ON billing_events(organization_id);
CREATE INDEX idx_billing_events_type ON billing_events(event_type);

-- Invitations (pending team members)
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES users(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

CREATE INDEX idx_invitations_org_id ON invitations(organization_id);
CREATE INDEX idx_invitations_token ON invitations(token);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'dark', -- light, dark, auto
  notifications_email BOOLEAN DEFAULT true,
  notifications_digest VARCHAR(50) DEFAULT 'weekly', -- daily, weekly, monthly, never
  locale VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(100) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Organization settings
CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  auto_sync_profiles BOOLEAN DEFAULT true,
  sync_interval_hours INT DEFAULT 24,
  enable_audit_logging BOOLEAN DEFAULT true,
  data_retention_days INT DEFAULT 90,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_org_settings_org_id ON organization_settings(organization_id);

-- Salesforce Users (synced from Salesforce API)
CREATE TABLE IF NOT EXISTS salesforce_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  salesforce_user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255),
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

CREATE INDEX idx_salesforce_users_org_id ON salesforce_users(organization_id);
CREATE INDEX idx_salesforce_users_connection_id ON salesforce_users(salesforce_connection_id);
CREATE INDEX idx_salesforce_users_salesforce_id ON salesforce_users(salesforce_user_id);

-- Object Permissions (synced from Salesforce API)
CREATE TABLE IF NOT EXISTS object_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  parent_id VARCHAR(255) NOT NULL, -- Salesforce Profile or PermissionSet ID
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

CREATE INDEX idx_object_permissions_org_id ON object_permissions(organization_id);
CREATE INDEX idx_object_permissions_connection_id ON object_permissions(salesforce_connection_id);
CREATE INDEX idx_object_permissions_parent_id ON object_permissions(parent_id, parent_type);

-- Salesforce Profiles (synced from Salesforce API)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  salesforce_profile_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_count INT DEFAULT 0,
  object_permission_count INT DEFAULT 0,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_profile_id)
);

CREATE INDEX idx_profiles_org_id ON profiles(organization_id);
CREATE INDEX idx_profiles_salesforce_id ON profiles(salesforce_profile_id);
CREATE INDEX idx_profiles_connection_id ON profiles(salesforce_connection_id);

-- Salesforce Permission Sets (synced from Salesforce API)
CREATE TABLE IF NOT EXISTS permission_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  salesforce_permset_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_count INT DEFAULT 0,
  object_permission_count INT DEFAULT 0,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_permset_id)
);

CREATE INDEX idx_permission_sets_org_id ON permission_sets(organization_id);
CREATE INDEX idx_permission_sets_salesforce_id ON permission_sets(salesforce_permset_id);
CREATE INDEX idx_permission_sets_connection_id ON permission_sets(salesforce_connection_id);

-- Field Permissions (synced from Salesforce API)
CREATE TABLE IF NOT EXISTS field_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  parent_id VARCHAR(255) NOT NULL, -- Salesforce Profile or PermissionSet ID
  parent_type VARCHAR(50) NOT NULL, -- 'Profile' or 'PermissionSet'
  salesforce_object_name VARCHAR(255) NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  permissions_edit BOOLEAN DEFAULT false,
  permissions_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, salesforce_connection_id, parent_id, salesforce_object_name, field_name)
);

CREATE INDEX idx_field_permissions_org_id ON field_permissions(organization_id);
CREATE INDEX idx_field_permissions_connection_id ON field_permissions(salesforce_connection_id);
CREATE INDEX idx_field_permissions_parent_id ON field_permissions(parent_id, parent_type);

-- Sync Jobs (track background sync progress)
CREATE TABLE IF NOT EXISTS sync_jobs (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  salesforce_connection_id UUID NOT NULL REFERENCES salesforce_connections(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL, -- full_sync, incremental_sync
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  progress INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_org_id ON sync_jobs(organization_id);
CREATE INDEX idx_sync_jobs_connection_id ON sync_jobs(salesforce_connection_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);

-- Permission Conversions (audit trail)
CREATE TABLE IF NOT EXISTS conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL, -- profile, permission_set
  source_id VARCHAR(255) NOT NULL,
  target_profiles TEXT[], -- array of profile IDs
  conversion_result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversions_org_id ON conversions(organization_id);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
