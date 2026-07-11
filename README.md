# PermBridge Web App

Standalone web application for intelligently managing Salesforce permissions.

**Status:** Phase 1 - Foundation (in development)  
**Stack:** React 18 + Node.js + PostgreSQL + Claude API

## Features

### Phase 1 (Current)
- ✅ Salesforce OAuth login flow
- ✅ Profile caching from Salesforce
- ✅ Permission Set caching from Salesforce
- ✅ PostgreSQL database schema
- ✅ Basic API endpoints for profiles and permission sets
- 🔄 Profile 2 Permset Converter (Claude integration coming)
- 🔄 Permission Set Summarizer (UI complete, details coming)
- 🔄 Permission Matrix X-Ray (Phase 3)

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Salesforce org (sandbox or production)
- Anthropic API key

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env

# Frontend  
cd frontend
npm install
```

### 2. Set Up Database

Start PostgreSQL and Redis:
```bash
docker-compose up -d
```

Run migrations:
```bash
cd backend
npm run db:migrate
```

### 3. Configure Salesforce OAuth

**[See detailed instructions in docs/SALESFORCE_SETUP.md](docs/SALESFORCE_SETUP.md)**

Quick summary:
1. Setup → App Manager → New Connected App
2. Name: "PermBridge"
3. Enable OAuth with scopes: `full`, `api`, `refresh_token`
4. Callback URL: `http://localhost:3001/api/auth/callback`
5. Copy Consumer Key & Secret to `.env`

### 4. Update .env Files

**backend/.env:**
```env
DATABASE_URL=postgresql://permbridge_user:permbridge_password@localhost:5432/permbridge
SALESFORCE_CLIENT_ID=your_consumer_key
SALESFORCE_CLIENT_SECRET=your_consumer_secret
SALESFORCE_REDIRECT_URI=http://localhost:3001/api/auth/callback
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=dev-secret-change-in-prod
```

### 5. Start Development

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Should see: ✓ PermBridge backend running on http://localhost:3001
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Should see: Local: http://localhost:5173
```

Visit `http://localhost:5173` and click "Login with Salesforce"

---

## Project Structure

```
permbridge-web-app/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express server
│   │   ├── db.ts               # PostgreSQL pool
│   │   ├── routes/
│   │   │   ├── auth.ts         # OAuth flow
│   │   │   ├── profiles.ts     # Profile endpoints
│   │   │   └── permsets.ts     # PermSet endpoints
│   │   ├── services/
│   │   │   ├── salesforceService.ts   # jsforce integration
│   │   │   └── claudeService.ts       # (coming soon)
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT authentication
│   │   └── utils/
│   │       └── jwt.ts          # Token utilities
│   ├── migrations/
│   │   └── 001_init_schema.sql # Database schema
│   ├── .env                    # Environment config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # React Router setup
│   │   ├── api/
│   │   │   ├── client.ts       # Axios client
│   │   │   └── endpoints.ts    # API routes
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── AuthSuccessPage.tsx
│   │   │   ├── ConverterPage.tsx
│   │   │   ├── SummarizerPage.tsx
│   │   │   └── MatrixPage.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts      # Auth hook
│   │   └── store/
│   │       └── authStore.ts    # Zustand store
│   └── package.json
│
├── docs/
│   ├── SALESFORCE_SETUP.md     # OAuth setup guide
│   ├── API.md                  # API documentation (coming)
│   └── DATABASE.md             # Schema reference (coming)
│
├── PROJECT_PLAN.md
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

### Auth
- `GET /api/auth/login` — Get OAuth URL
- `GET /api/auth/callback` — OAuth callback
- `GET /api/auth/me` — Current user info
- `POST /api/auth/logout` — Logout

### Profiles
- `GET /api/profiles` — List all profiles
- `GET /api/profiles/:id` — Get profile details
- `POST /api/profiles/:id/analyze` — Prepare for conversion

### Permission Sets
- `GET /api/permsets` — List all permission sets
- `GET /api/permsets/:id` — Get permission set details
- `GET /api/permsets/search/:query` — Search permission sets

---

## Architecture

```
Frontend (React)              Backend (Node.js/Express)     Salesforce
  ↓                                ↓                            ↓
Login Page                   OAuth flow ↔ Connected App
  ↓                                ↓                            ↓
Home                    PostgreSQL cache ← Sync hourly
  ↓                           JWT token                         ↓
[Converter]               /api/profiles                    Query metadata
[Summarizer]              /api/permsets                    Query fields
[Matrix]                  /api/convert      Claude API →    Store metadata
```

---

## Database Schema

### users
- OAuth tokens stored securely
- Org and user info cached

### profiles
- Profile names, descriptions
- Cached from Salesforce
- Last synced timestamp

### permission_sets  
- PermSet names, descriptions
- Cached from Salesforce

### conversions
- Profile conversion history
- Suggested groupings (JSON)
- Created PermSet IDs

### audit_logs
- Track all actions
- Who, what, when
- Full changelog

---

## Development

### Run Tests
```bash
cd backend && npm test
cd frontend && npm test
```

### Linting
```bash
cd frontend && npm run lint
```

### Build for Production
```bash
cd backend && npm run build
cd frontend && npm run build
```

---

## Troubleshooting

**"Could not connect to database"**
```bash
docker-compose ps  # Check if postgres is running
docker-compose logs postgres  # View logs
```

**"invalid_client_id" from Salesforce**
- Verify SALESFORCE_CLIENT_ID in .env
- Wait 5 minutes after creating Connected App
- Check app status is "Active" in Setup

**Frontend can't reach backend**
- Is backend running on port 3001? (`npm run dev`)
- Try `http://localhost:3001/health` directly
- Check Vite proxy in `vite.config.ts`

**OAuth callback not working**
- Verify SALESFORCE_REDIRECT_URI in .env matches Connected App
- Check browser console for errors

---

## Roadmap

| Phase | Timeline | Focus |
|-------|----------|-------|
| **1** | Weeks 1-2 | Foundation: OAuth, database, basic UI |
| **2** | Weeks 3-4 | Polish: styling, audit logging |
| **3** | Weeks 5-7 | Power features: heatmaps, bulk convert |
| **4** | Ongoing | Monitoring, optimization, reliability |

---

## Next Steps

1. ✅ Backend foundation complete
2. ✅ Frontend OAuth login complete
3. ⏳ Test with real Salesforce org
4. ⏳ Implement Claude API for AI conversion
5. ⏳ Add permission details to pages
6. ⏳ Deploy to staging
7. ⏳ User testing and feedback

---

## Resources

- [PROJECT_PLAN.md](PROJECT_PLAN.md) — Full architecture & phases
- [Salesforce OAuth Setup](docs/SALESFORCE_SETUP.md) — Connected App instructions
- [Salesforce API Docs](https://developer.salesforce.com/docs)
- [Claude API](https://console.anthropic.com)

---

Built with ❤️ for Salesforce admins | **PermBridge** © 2026
