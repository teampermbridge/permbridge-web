# Salesforce OAuth Connected App Setup

PermBridge uses Salesforce OAuth 2.0 to connect to your org securely. Follow these steps to create a Connected App.

## Step 1: Create a Connected App

1. Log in to your Salesforce org as an admin
2. Go to **Setup** → **Apps** → **App Manager**
3. Click **New Connected App**
4. Fill in the form:
   - **Connected App Name:** `PermBridge`
   - **Contact Email:** your email
   - **Description:** `Permission management and conversion tool`

## Step 2: Enable OAuth Settings

1. Check **Enable OAuth Settings**
2. Set the **Callback URL** to:
   - **Development:** `http://localhost:3001/api/auth/callback`
   - **Production:** `https://your-deployed-backend.com/api/auth/callback`
3. Under **Selected OAuth Scopes**, add:
   - `full` — Full access to org
   - `api` — Access to API
   - `refresh_token` — Get a refresh token (recommended)

4. Save the Connected App

## Step 3: Get Credentials

1. Wait ~2-5 minutes for the Connected App to fully activate
2. Go to **Setup** → **Apps** → **App Manager**
3. Find and click on **PermBridge**
4. Click **View** next to "Consumer Key"
5. Copy the following values:
   - **Consumer Key** → `SALESFORCE_CLIENT_ID`
   - **Consumer Secret** → `SALESFORCE_CLIENT_SECRET` (click "Show")

## Step 4: Configure Environment

Update your `.env` file with the credentials:

```env
SALESFORCE_CLIENT_ID=your_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_consumer_secret_here
SALESFORCE_REDIRECT_URI=http://localhost:3001/api/auth/callback
SALESFORCE_INSTANCE_URL=https://login.salesforce.com  # or your sandbox instance
```

## Step 5: Test OAuth Flow

1. Start the backend: `npm run dev` (in `/backend`)
2. Start the frontend: `npm run dev` (in `/frontend`)
3. Navigate to `http://localhost:5173/login`
4. Click "Login with Salesforce"
5. Authorize the Connected App when prompted

## Optional: Configure IP Whitelist

For security, you can restrict the Connected App to specific IPs:

1. In the Connected App settings, go to **OAuth Policies**
2. Set **Require Proof Key for Public Clients** to `Require code challenge`
3. Set **Require Secret for Server-to-Server Flows** to `No` (already enabled)

## Troubleshooting

### "Invalid client id" error
- Verify `SALESFORCE_CLIENT_ID` is correct and not truncated
- Wait ~5 minutes after creating the Connected App
- Check that the Connected App status is "Active"

### "redirect_uri mismatch" error
- Verify the redirect URI exactly matches what's configured in the Connected App
- Check for trailing slashes and https/http mismatch

### "Refresh token not found" error
- Add `refresh_token` to the OAuth scopes (see Step 2)
- Revoke the Connected App from your account and re-authorize

### Sandbox vs Production
- Use `https://test.salesforce.com` for sandboxes (in `SALESFORCE_INSTANCE_URL`)
- Use `https://login.salesforce.com` for production

## Revoking Access

If you need to disconnect PermBridge:

1. Go to **Setup** → **Personal Settings** → **Connected Apps & OAuth Tokens**
2. Find "PermBridge" and click **Revoke**

## Resources

- [Salesforce OAuth 2.0 Documentation](https://developer.salesforce.com/docs/atlas.en-us.oauth_guide.meta/oauth_guide/oauth_web_server_flow.htm)
- [Connected Apps Setup](https://help.salesforce.com/s/articleView?id=sf.connected_app_overview.htm)
- [API Scopes Reference](https://developer.salesforce.com/docs/atlas.en-us.oauth_guide.meta/oauth_guide/oauth_scopes.htm)
