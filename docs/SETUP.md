# PermBridge Setup Guide

Complete walkthrough of setting up PermBridge locally for Phase 1 development.

## What's Been Built

✅ **Backend Foundation**
- Express server with TypeScript
- PostgreSQL database connection pool
- Database schema (users, profiles, permission_sets, conversions, audit_logs)
- Salesforce OAuth flow (login → callback → token storage)
- JWT authentication middleware
- API routes for auth, profiles, and permission sets
- Salesforce API integration (jsforce)

✅ **Frontend Foundation**
- React app with TypeScript
- React Router for navigation
- Zustand store for auth state
- TanStack Query for data fetching
- Axios client with auth interceptors
- Pages: Login, Home, Converter, Summarizer, Matrix
- TailwindCSS styling

✅ **Infrastructure**
- Docker Compose (PostgreSQL + Redis)
- Database migrations system
- Environment configuration

## Setup Instructions

### Step 1: Clone & Install

```bash
cd /Users/renoredaja/Documents/code/permbridge-web-app

# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Step 2: Start Database Services

```bash
# In project root
docker-compose up -d

# Verify containers are running
docker-compose ps
# Output should show postgres and redis as "Up"
```

### Step 3: Run Database Migrations

```bash
cd backend

# Create tables
npm run db:migrate

# You should see:
# ✓ Running migration: 001_init_schema.sql
# ✓ Completed: 001_init_schema.sql
# ✓ All migrations completed
```

### Step 4: Create Salesforce Connected App

**[Follow detailed instructions in SALESFORCE_SETUP.md](SALESFORCE_SETUP.md)**

This takes 5-10 minutes. You need:
- Consumer Key (becomes `SALESFORCE_CLIENT_ID`)
- Consumer Secret (becomes `SALESFORCE_CLIENT_SECRET`)

### Step 5: Configure Environment Variables

**backend/.env:**
```bash
cd backend
cat > .env << 'EOF'
DATABASE_URL=postgresql://permbridge_user:permbridge_password@localhost:5432/permbridge

SALESFORCE_CLIENT_ID=your_consumer_key_from_connected_app
SALESFORCE_CLIENT_SECRET=your_consumer_secret_from_connected_app
SALESFORCE_REDIRECT_URI=http://localhost:3001/api/auth/callback
SALESFORCE_INSTANCE_URL=https://login.salesforce.com

ANTHROPIC_API_KEY=sk-ant-your_api_key_from_console_anthropic_com

PORT=3001
NODE_ENV=development
JWT_SECRET=permbridge-dev-secret-change-in-production
EOF
```

Verify the file:
```bash
cat .env  # Should show all variables
```

**frontend/.env.local** (optional, defaults to localhost:3001):
```bash
cd ../frontend
echo "VITE_API_URL=http://localhost:3001" > .env.local
```

### Step 6: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev

# Expected output:
# ✓ PermBridge backend running on http://localhost:3001
# ✓ Environment: development
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev

# Expected output:
# ✓ ready in 234ms.
# ➜ Local:   http://localhost:5173/
# ➜ press h to show help
```

### Step 7: Test OAuth Flow

1. Open browser to `http://localhost:5173`
2. Click **"Login with Salesforce"**
3. You'll be redirected to Salesforce login
4. Log in with your Salesforce sandbox/org credentials
5. Authorize the "PermBridge" Connected App
6. You'll be redirected back to the home page showing your profiles

## What to Test

### Backend Endpoints

Test the API directly:

```bash
# Health check
curl http://localhost:3001/health

# Get login URL (before auth)
curl http://localhost:3001/api/auth/login

# After login, you'll have a token. Use it:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/auth/me

# Get profiles (requires valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/profiles

# Get permission sets (requires valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/permsets
```

### Frontend Pages

- **Login Page** (`http://localhost:5173`) — Test OAuth redirect
- **Home Page** (`http://localhost:5173/`) — Shows user info and feature cards
- **Converter** (`http://localhost:5173/converter`) — Lists profiles from Salesforce
- **Summarizer** (`http://localhost:5173/summarizer`) — Lists permission sets
- **Matrix** (`http://localhost:5173/matrix`) — Coming in Phase 3

## Troubleshooting

### Database Connection Error

```
ERROR: could not connect to server: Connection refused
```

**Solution:**
```bash
# Check containers are running
docker-compose ps

# If not, start them
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### "invalid_client_id" from Salesforce

**Solution:**
1. Verify `SALESFORCE_CLIENT_ID` is exactly right (no typos)
2. Wait 5 minutes after creating Connected App
3. Check Connected App status is "Active" in Salesforce Setup
4. Try creating a new Connected App

### "redirect_uri mismatch" error

**Solution:**
- Check that `SALESFORCE_REDIRECT_URI` in `.env` exactly matches the Callback URL in Connected App
- No trailing slashes
- http vs https must match exactly

### Frontend can't reach backend

```
Error: Network Error (or CORS error in console)
```

**Solution:**
```bash
# Verify backend is running
curl http://localhost:3001/health

# Check Vite proxy settings in frontend/vite.config.ts
# Should have:
# proxy: {
#   '/api': {
#     target: 'http://localhost:3001',
#     changeOrigin: true,
#   },
# }
```

### Token expires immediately

**Solution:**
- JWT token lifetime is 7 days (set in `src/utils/jwt.ts`)
- To refresh during dev, create new login
- In production, implement token refresh endpoint

### Profiles/Permission Sets won't load

**Solution:**
1. Verify Salesforce org has profiles and permission sets
2. Check user has API access in Salesforce
3. Test with an admin user first
4. Check backend logs: `npm run dev` output

## Database Inspection

### Connect to PostgreSQL

```bash
# Using psql (if installed)
psql -h localhost -U permbridge_user -d permbridge

# Or via Docker
docker exec -it permbridge-db psql -U permbridge_user -d permbridge
```

### Check Tables

```sql
-- Show all tables
\dt

-- Check users
SELECT id, email, name, created_at FROM users;

-- Check profiles
SELECT id, name, permissions_count FROM profiles;

-- Check audit logs
SELECT user_id, action, created_at FROM audit_logs ORDER BY created_at DESC;
```

## What's Next

### Phase 1 Remaining Tasks

- [ ] Test OAuth flow end-to-end with real Salesforce org
- [ ] Implement Claude API integration for profile analysis
- [ ] Add permission details display (objects, fields)
- [ ] Create conversion flow UI
- [ ] Wire up audit logging for user actions
- [ ] Test with multiple profiles and permission sets

### Phase 2 (UI Polish)

- [ ] TailwindCSS theming (light/dark mode)
- [ ] shadcn/ui components (forms, tables, dialogs)
- [ ] Loading states and error handling
- [ ] Responsive mobile design
- [ ] Permission change history

### Phase 3 (Power Features)

- [ ] Heatmap visualization
- [ ] Permission diff view
- [ ] Bulk convert profiles
- [ ] PDF/CSV export
- [ ] Slack integration

## Development Tips

### Hot Reload

Both backend and frontend support hot reload:
- **Backend:** `tsx watch` watches for changes
- **Frontend:** Vite automatically refreshes

### Debugging

**Backend:**
```bash
# See detailed logs
NODE_DEBUG=* npm run dev

# Check database queries
# Slow queries (>1s) are logged automatically
```

**Frontend:**
```bash
# React DevTools browser extension recommended
# Console logs visible in browser DevTools
```

### Database Backups

```bash
# Backup
docker exec permbridge-db pg_dump -U permbridge_user permbridge > backup.sql

# Restore
docker exec -i permbridge-db psql -U permbridge_user permbridge < backup.sql
```

## Performance Notes

- Profiles/PermSets cached for 1 hour
- Large queries paginated at 100 records
- Token lifetime: 7 days
- Database connection pool: 20 connections

## Security Checklist

- ✅ OAuth tokens stored in database
- ✅ JWT tokens signed with secret
- ✅ CORS configured to localhost only (dev)
- ✅ SQL queries use parameterized statements
- ✅ Auth middleware protects all API routes
- ⚠️ JWT_SECRET should be random in production
- ⚠️ Database password should be strong in production
- ⚠️ Add HTTPS in production

## Deployment Readiness

For production deployment, review:
- [docs/DEPLOYMENT.md](DEPLOYMENT.md) — Railway backend, Vercel frontend
- [docs/DATABASE.md](DATABASE.md) — Schema reference
- [docs/API.md](API.md) — Complete API documentation

---

**Stuck?** Check the troubleshooting section or review PROJECT_PLAN.md for context.
