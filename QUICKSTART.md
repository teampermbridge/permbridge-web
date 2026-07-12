# PermBridge Quick Start Checklist

**TL;DR** - Minimal steps to get PermBridge running locally.

## 1. Prerequisites Installed?
- [ ] Node.js 18+ (`node --version`)
- [ ] PostgreSQL running (`psql --version`)
- [ ] Git

## 2. Database (5 min)
```bash
# Create database and user
createdb permbridge
psql permbridge -c "CREATE USER permbridge_user WITH PASSWORD 'permbridge_password';"
psql permbridge -c "GRANT ALL PRIVILEGES ON DATABASE permbridge TO permbridge_user;"

# Run migration
cd backend
node -e "import('pg').then(pg => { /* run migration */ })"
# OR use: npm run migrate (if available)
```

**Critical:** Use `migrations/002_add_saas_tables.sql` (NOT 001_init_schema.sql)

## 3. Salesforce OAuth Setup (10 min)
1. Go to Salesforce Setup > Apps > App Manager
2. Create New Connected App named "PermBridge"
3. Enable OAuth Settings
4. Set Callback URL to: `http://localhost:3001/api/auth/salesforce/callback`
5. Add Scopes: `full`, `refresh_token`, `api`
6. Copy Consumer Key and Consumer Secret

## 4. Backend (.env) (2 min)
```bash
cd backend
cp .env.example .env
# Edit .env with your values:
# - DATABASE_URL (already set)
# - SALESFORCE_CLIENT_ID (from step 3)
# - SALESFORCE_CLIENT_SECRET (from step 3)
```

**Critical Environment Variables:**
```
SALESFORCE_REDIRECT_URI=http://localhost:3001/api/auth/salesforce/callback  # EXACT
SALESFORCE_CLIENT_ID=your-value
SALESFORCE_CLIENT_SECRET=your-value
DATABASE_URL=postgresql://permbridge_user:permbridge_password@localhost:5432/permbridge
```

## 5. Frontend (.env) (1 min)
```bash
cd frontend
cp .env.example .env.local
# Content should be:
# VITE_API_URL=http://localhost:3001
```

## 6. Install & Start (3 min)
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev
# Should show: ✓ PermBridge backend running on http://localhost:3001

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
# Should show: ➜  Local:   http://localhost:5173/
```

## 7. Test the Flow (5 min)
1. Open http://localhost:5173/register
2. Create account with valid email
3. Login with same email/password
4. Enter Salesforce org domain (e.g., `myorg.my.salesforce.com`)
5. Click Connect → Redirects to Salesforce login
6. Authorize app
7. Should land on Dashboard with real data

✅ **If you see real profile/permset/user counts → Success!**

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `column 'full_name' does not exist` | Run migration 002_add_saas_tables.sql |
| `error=redirect_uri_mismatch` | Verify Salesforce app callback URL is exactly `http://localhost:3001/api/auth/salesforce/callback` |
| `API returns 404` | Check frontend is using `/api/` prefix: `client.post('/api/auth/register')` |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL not running: `brew services start postgresql` |
| `Cannot GET /login` | Frontend not running on port 5173 |

---

## Full Setup Guide

For detailed instructions, see [SETUP.md](./SETUP.md)

---

**Phase Status:** Phase 2 Complete ✅
- Email/Password Authentication
- Salesforce OAuth  
- Dashboard with Real Data
- Converter, Summarizer, Matrix pages (UI only)
