import * as jsforce from 'jsforce';

type Connection = jsforce.Connection;

interface SalesforceTokenResponse {
  access_token: string;
  refresh_token?: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

interface SalesforceUserInfo {
  id: string;
  email: string;
  name: string;
  org_id: string;
  instance_url: string;
}

export async function getAuthorizationUrl(): Promise<string> {
  const clientId = process.env.SALESFORCE_CLIENT_ID!;
  const redirectUri = process.env.SALESFORCE_REDIRECT_URI!;
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL || 'https://login.salesforce.com';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'full refresh_token api',
    prompt: 'login',
  });

  return `${instanceUrl}/services/oauth2/authorize?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<SalesforceTokenResponse> {
  const clientId = process.env.SALESFORCE_CLIENT_ID!;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET!;
  const redirectUri = process.env.SALESFORCE_REDIRECT_URI!;
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL || 'https://login.salesforce.com';

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${instanceUrl}/services/oauth2/token`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

export async function getUserInfo(
  accessToken: string,
  instanceUrl: string
): Promise<SalesforceUserInfo> {
  const response = await fetch(`${instanceUrl}/services/oauth2/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const data = await response.json();
  return {
    id: data.user_id,
    email: data.email,
    name: data.name,
    org_id: data.organization_id,
    instance_url: instanceUrl,
  };
}

export async function refreshAccessToken(
  refreshToken: string,
  instanceUrl: string
): Promise<SalesforceTokenResponse> {
  const clientId = process.env.SALESFORCE_CLIENT_ID!;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET!;

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`${instanceUrl}/services/oauth2/token`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return response.json();
}

export function createConnection(accessToken: string, instanceUrl: string): Connection {
  const conn = new jsforce.Connection({
    instanceUrl,
    accessToken,
  });
  return conn;
}

export async function getProfiles(conn: Connection): Promise<any[]> {
  const query = "SELECT Id, Name, Description FROM Profile ORDER BY Name";
  const records = await conn.query(query);
  return records.records || [];
}

export async function getPermissionSets(conn: Connection): Promise<any[]> {
  const query = "SELECT Id, Name, Description FROM PermissionSet WHERE IsOwnedByProfile = false ORDER BY Name";
  const records = await conn.query(query);
  return records.records || [];
}

export async function getProfilePermissions(conn: Connection, profileId: string): Promise<any> {
  // Get all object permissions for a profile
  const objectPerms = await conn.query(
    `SELECT Id, SobjectType, PermissionsCreate, PermissionsRead, PermissionsEdit, PermissionsDelete
     FROM ObjectPermission WHERE ParentId = '${profileId}'`
  );

  // Get field permissions
  const fieldPerms = await conn.query(
    `SELECT Id, SobjectType, Field, PermissionsEdit, PermissionsRead
     FROM FieldPermission WHERE ParentId = '${profileId}'`
  );

  return {
    objectPermissions: objectPerms.records || [],
    fieldPermissions: fieldPerms.records || [],
  };
}

export async function getPermissionSetPermissions(conn: Connection, permsetId: string): Promise<any> {
  const objectPerms = await conn.query(
    `SELECT Id, SobjectType, PermissionsCreate, PermissionsRead, PermissionsEdit, PermissionsDelete
     FROM ObjectPermission WHERE ParentId = '${permsetId}'`
  );

  const fieldPerms = await conn.query(
    `SELECT Id, SobjectType, Field, PermissionsEdit, PermissionsRead
     FROM FieldPermission WHERE ParentId = '${permsetId}'`
  );

  return {
    objectPermissions: objectPerms.records || [],
    fieldPermissions: fieldPerms.records || [],
  };
}
