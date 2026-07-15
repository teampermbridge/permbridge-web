# PermBridge Setup Guide

Complete walkthrough to get PermBridge running locally from scratch.

Complete walkthrough to get the application running locally from scratch.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Git
- Salesforce Developer Org (sandbox or production for testing)

## 1. Database Setup

### 1.1 Create PostgreSQL Database

```bash
createdb permbridge
psql permbridge
```

Or using environment variables:
```bash
PGUSER=postgres PGPASSWORD=password createdb permbridge
```

### 1.2 Create Database User

```sql
CREATE USER permbridge_user WITH PASSWORD 'permbridge_password';
ALTER ROLE permbridge_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE permbridge TO permbridge_user;
```

### 1.3 Run Database Migrations

Navigate to backend directory and run the SaaS schema migration:

```bash
cd backend
node -e "
import('./node_modules/pg/lib/index.js').then(pg => {
  const pool = new pg.Pool({ connectionString: 'postgresql://permbridge_user:permbridge_password@localhost:5432/permbridge' });
  const fs = require('fs');
  const sql = fs.readFileSync('./migrations/002_add_saas_tables.sql', 'utf-8');
  pool.query(sql).then(() => {
    console.log('✓ Database migration completed');
    process.exit(0);
  }).catch(err => {
    console.error('Migration error:', err.message);
    process.exit(1);
  });
});
"
```

Or use the provided script (if available):
```bash
npm run migrate
```

**Critical:** Do NOT run `migrations/001_init_schema.sql` - it contains the old Salesforce-only schema. Always use `002_add_saas_tables.sql` for the current SaaS architecture.

## 2. Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

Create `.env` file in `backend/` directory with these values:

```env
# Database
DATABASE_URL=postgresql://permbridge_user:permbridge_password@localhost:5432/permbridge

# Salesforce OAuth Configuration
SALESFORCE_CLIENT_ID=your-salesforce-client-id
SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret
SALESFORCE_REDIRECT_URI=http://localhost:3001/api/auth/salesforce/callback
SALESFORCE_INSTANCE_URL=https://login.salesforce.com

# App Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=permbridge-dev-secret-change-in-production

# Claude API (for AI features)
ANTHROPIC_API_KEY=your-anthropic-api-key
```

**Important Environment Variables:**

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | PostgreSQL connection string | Must match your local database setup |
| `SALESFORCE_CLIENT_ID` | From Connected App | See section 3 below |
| `SALESFORCE_CLIENT_SECRET` | From Connected App | Keep private, never commit to git |
| `SALESFORCE_REDIRECT_URI` | `http://localhost:3001/api/auth/salesforce/callback` | **MUST match this exact path** |
| `PORT` | 3001 | Backend server port |
| `NODE_ENV` | development | Local development mode |
| `JWT_SECRET` | Any secure string | Change for production |

### 2.3 Start Backend Server

```bash
npm run dev
```

Expected output:
```
✓ PermBridge backend running on http://localhost:3001
✓ Environment: development
```

Test health check:
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

## 3. Salesforce OAuth Configuration (External Client App)

⚠️ **Important Update (Spring 2026):** Salesforce deprecated Connected Apps for new integrations. Use **External Client Apps (ECAs)** instead. Our OAuth code works with both—no implementation changes needed!

### 3.1 Create an External Client App

1. Log in to your **Salesforce Developer Org** (or sandbox)
2. Navigate to **Setup > App Manager** (search "App Manager" in Quick Find)
3. Click **New External Client App**
4. Fill in **Basic Information**:
   - **Name:** PermBridge
   - **API Name:** PermBridge (auto-generated)
   - **Contact Email:** your-email@example.com
   - **Distribution State:** Local
5. Click **Save**

### 3.2 Enable OAuth Settings

1. Go back to the app in App Manager
2. Click the **dropdown menu** → **View**
3. Scroll to **OAuth Settings** section
4. Click **Edit** and configure:
   - ✓ Check **Enable OAuth**
   - ✓ Select **Web Server Flow** under OAuth Flows
   - ✓ Check **Require Secret for Web Server Flow**
   - ✓ Check **Require Secret for Refresh Token Flow**

### 3.3 Configure OAuth Scopes

1. In OAuth Settings, select **OAuth Scopes** to enable:
   - ✓ `api` - REST/Bulk API access
   - ✓ `refresh_token` - Refresh token flow
   - ✓ `web` - Web access
   - ✓ `openid` - User identity (OpenID Connect)

2. Click **Save**

### 3.4 Set Redirect URI

1. In OAuth Settings, scroll to **Callback URL**
2. Enter: `http://localhost:3001/api/auth/salesforce/callback`
3. For production, add additional URLs (one per line):
   ```
   http://localhost:3001/api/auth/salesforce/callback
   https://yourdomain.com/api/auth/salesforce/callback
   ```
4. Click **Save**

**Important:** The redirect URI is case-sensitive and must match exactly.

### 3.5 Get Credentials

1. From **App Manager**, locate your PermBridge app
2. Click the **dropdown menu** → **View**
3. Scroll to **Consumer Key and Secret** section
4. Click **Manage Consumer Details**
5. Verify your identity (email/phone confirmation—you have 5 minutes)
6. Copy and save:
   - **Consumer Key** = `SALESFORCE_CLIENT_ID`
   - **Consumer Secret** = `SALESFORCE_CLIENT_SECRET`
7. Add to backend `.env`:
   ```env
   SALESFORCE_CLIENT_ID=your-consumer-key
   SALESFORCE_CLIENT_SECRET=your-consumer-secret
   ```

**Security Note:** Credentials will rotate if you click "Rotate" in the future, invalidating existing tokens. Changes take ~10 minutes to propagate.

### 3.6 Verify Configuration

Double-check in Salesforce:
- ✓ OAuth enabled
- ✓ Web Server Flow selected
- ✓ Secrets required for both Web and Refresh flows
- ✓ Redirect URI set to: `http://localhost:3001/api/auth/salesforce/callback`
- ✓ Scopes: api, refresh_token, web, openid

**If you see `error=redirect_uri_mismatch`:** The callback URL doesn't match exactly. Check for typos, trailing slashes, or protocol differences.

## 4. Frontend Setup

### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

### 4.2 Configure Environment Variables

Create `.env.local` file in `frontend/` directory:

```env
VITE_API_URL=http://localhost:3001
```

### 4.3 Start Frontend Dev Server

```bash
npm run dev
```

Expected output:
```
VITE v5.4.21  ready in 258 ms

➜  Local:   http://localhost:5173/
```

## 5. Testing the Full Flow

### 5.1 Register a New Account

1. Open http://localhost:5173/register
2. Fill in form:
   - Work email: `your-email@example.com`
   - Full name: `Your Name`
   - Organization name: `Test Org`
   - Password: (min 8 chars)
3. Click **Create Account**

Expected behavior:
- Account created in database
- Redirected to `/connect` page
- Auth token stored in localStorage

### 5.2 Connect Salesforce Org

1. On Connect page, enter your Salesforce org domain (e.g., `myorg.my.salesforce.com` or `myorg--sandbox.sandbox.my.salesforce.com`)
2. Click **Connect**
3. You'll be redirected to Salesforce login
4. Log in with your Salesforce credentials
5. Authorize the app to access your org
6. Redirect back to PermBridge Dashboard

Expected behavior:
- Salesforce connection stored in database
- Sync begins in background
- Dashboard shows profile/permset/user counts
- `/dashboard` page accessible

### 5.3 Verify Dashboard

Dashboard should display:
- Real data from Salesforce (profile count, permission sets, users)
- Converter tool card
- Summarizer tool card
- Matrix tool card

## 6. API Endpoint Checklist

All API calls from frontend use this base URL: `http://localhost:3001`

### Authentication Routes
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/salesforce/login` - Initiate Salesforce OAuth
- `GET /api/auth/salesforce/callback` - OAuth redirect (Salesforce)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Dashboard Routes
- `GET /api/dashboard/org/:orgId` - Get org stats (profiles, permsets, users)

### Salesforce Routes
- `GET /api/salesforce/org/:orgId/profiles` - List profiles with counts
- `GET /api/salesforce/org/:orgId/permsets` - List permission sets
- `POST /api/auth/salesforce/sync` - Start background sync
- `GET /api/auth/salesforce/sync-status/:jobId` - Check sync progress

**Important:** All frontend API calls MUST include `/api/` prefix in the path.

Example:
```javascript
// ✅ CORRECT
client.post('/api/auth/register', { ... })
client.get('/api/salesforce/org/:orgId/profiles')

// ❌ WRONG
client.post('/auth/register', { ... })
client.get('/salesforce/org/:orgId/profiles')
```

## 7. Database Schema Overview

### Current Tables (from `002_add_saas_tables.sql`)

**users**
- id, email, password_hash, full_name, avatar_url
- email_verified, two_factor_enabled
- created_at, updated_at

**organizations**
- id, name, slug, owner_id
- tier (free/pro/enterprise), subscription_status
- created_at, updated_at

**organization_members**
- organization_id, user_id, role (owner/admin/member/viewer)
- joined_at

**salesforce_connections**
- id, organization_id, user_id
- salesforce_org_id, salesforce_user_id, salesforce_instance_url
- access_token, refresh_token, token_expires_at
- is_primary, last_synced_at

**profiles**
- id, organization_id, salesforce_profile_id
- name, description, user_count, object_permission_count

**permission_sets**
- id, organization_id, salesforce_permset_id
- name, description, user_count, object_permission_count

**subscriptions**
- id, organization_id, plan_id, stripe_subscription_id
- status, current_period_start, current_period_end

## 8. Troubleshooting

### Database Connection Error
```
error: connect ECONNREFUSED 127.0.0.1:5432
```
**Fix:** Check PostgreSQL is running
```bash
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

### "column 'full_name' does not exist" Error
**Fix:** Run the database migration (section 1.3). Old schema was used.
```bash
node migrate-clean.js  # If available
```

### Salesforce OAuth Redirect URI Mismatch
```
error=redirect_uri_mismatch&error_description=redirect_uri%20mismatch
```
**Fix:** Verify in Salesforce Connected App that callback URL is exactly:
```
http://localhost:3001/api/auth/salesforce/callback
```

### API Endpoint Returns 404
**Cause:** Frontend is missing `/api/` prefix
**Fix:** Update frontend code to use `/api/` in all client.post/get calls

### Sync Not Starting After Salesforce Connection
**Check:** 
1. Salesforce connection created in database
2. Access token not expired
3. Backend logs for sync errors
```bash
# Watch backend logs
npm run dev  # Shows console logs
```

## 9. Development Commands

### Backend
```bash
cd backend
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm test            # Run tests (if available)
```

### Frontend
```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Database
```bash
# Connect to database
psql postgresql://permbridge_user:permbridge_password@localhost:5432/permbridge

# Reset database (WARNING: deletes all data)
psql -U permbridge_user -d permbridge -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then run migration again
npm run migrate
```

## 10. Production Deployment Checklist

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Use production PostgreSQL database
- [ ] Update Salesforce Connected App callback URL to production domain
- [ ] Add production frontend URL to CORS allowlist
- [ ] Set real `ANTHROPIC_API_KEY`
- [ ] Store secrets in environment variables, never in `.env`
- [ ] Enable HTTPS (required for Salesforce OAuth)
- [ ] Test full auth flow in production

## 11. File Structure Reference

```
permbridge-web-app/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app setup & routes
│   │   ├── db.ts               # PostgreSQL connection
│   │   ├── routes/
│   │   │   ├── auth.ts         # Login, register, OAuth
│   │   │   ├── dashboard.ts    # Stats & metrics
│   │   │   ├── salesforce.ts   # Profiles, permsets
│   │   ├── services/
│   │   │   ├── syncService.ts  # Background Salesforce sync
│   │   │   ├── salesforceService.ts # OAuth & API calls
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT authentication
│   │   └── utils/
│   │       ├── jwt.ts
│   │       └── password.ts
│   ├── migrations/
│   │   ├── 001_init_schema.sql (OLD - do not use)
│   │   └── 002_add_saas_tables.sql (CURRENT - use this)
│   └── .env                    # Environment variables (never commit)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ConnectPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── ConverterPage.tsx
│   │   │   ├── SummarizerPage.tsx
│   │   │   └── MatrixPage.tsx
│   │   ├── api/
│   │   │   └── client.ts       # Axios instance with base URL
│   │   ├── store/
│   │   │   └── authStore.ts    # Auth state management
│   │   └── App.tsx
│   └── .env.local              # Frontend env vars
│
├── SETUP.md                    # This file
├── BRANCHING.md                # Git flow strategy
└── README.md                   # Project overview
```

## 12. Next Steps

After completing setup:

1. ✅ Test full registration → login → Salesforce connect flow
2. ✅ Verify Dashboard shows real Salesforce data
3. ✅ Test Converter, Summarizer, Matrix pages
4. Create PR from `feature/phase-2-data-display` → `develop`
5. Implement Phase 3 (Permission Converter AI logic)

---

**Last Updated:** 2026-07-12
**Status:** Phase 2 Complete (Email Auth + Salesforce OAuth + Data Display)
