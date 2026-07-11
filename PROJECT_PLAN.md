# PermBridge Web App Pivot

**Status:** In Planning  
**Started:** July 11, 2026  
**Owner:** Reno Redaja

---

## Executive Decision

We are pivoting PermBridge from a Salesforce LWC app to a **standalone web app**. This removes the $1k security review friction per feature and enables rapid iteration.

### Why Now?

1. **Salesforce cancelled Profile retirement** (Spring 2026 deadline is gone)
   - Original urgency narrative is now moot
   - **But:** Admins still value permission management — the need didn't go away
   
2. **Security review bottleneck is the real constraint**
   - $1k per submission, no guarantee of approval
   - Slows feature development to crawl
   - Web app = instant deployment, no reviews needed

3. **We've proven the value in Salesforce**
   - Profile 2 Permset Converter (Einstein AI-powered)
   - Permission Set Summarizer (full metadata snapshot)
   - Permission Matrix X-Ray (cross-profile comparison)
   - **Now:** Reposition as best-in-class permission tool, not emergency migration helper

### New Value Prop

**Old:** "Escape your Profiles before Spring 2026"  
**New:** "Intelligently manage permissions — Profile or Permission Set based"

---

## What We're Building

A **standalone web app** that connects to Salesforce via OAuth and replicates + enhances the 3 core features:

### Feature 1: Profile 2 Permset Converter
- **What:** Convert Profiles → Permission Sets using AI grouping
- **How:** Claude API (not Einstein) for better quality, cheaper, unlimited
- **UX improvements:**
  - Real-time AI streaming
  - Undo/redo for edits
  - Save & reuse conversion templates
  - Batch convert multiple profiles

### Feature 2: Permission Set Summarizer
- **What:** 360° view of any Permission Set / Permission Set Group
- **UX improvements:**
  - Visual permission graph
  - Diff view (compare 2 PSs)
  - PDF/CSV export
  - Permission search
  - Audit trail (who changed what when)

### Feature 3: Permission Matrix X-Ray
- **What:** Cross-org permission comparison matrix
- **UX improvements:**
  - Heatmap visualization
  - Permission inheritance tree
  - Conflict detection
  - Slack/email alerts for risky combos
  - Trend analysis

---

## Technical Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **Data Fetching:** TanStack Query (React Query)
- **State:** Zustand
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js + Express
- **Database:** PostgreSQL (caching + audit trail)
- **Job Queue:** Bull/Redis (async bulk operations)
- **Salesforce SDK:** jsforce or @salesforce/sf
- **LLM:** Claude API (Anthropic)
- **Deployment:** Railway or Render

### Infrastructure
- OAuth 2.0 (Salesforce Connected App)
- GitHub Actions (CI/CD)
- Docker (local dev + production)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  PermBridge Web App                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend (React)              Backend (Node.js)    │
│  ├─ Profile Converter     ├─ /api/profiles         │
│  ├─ Summarizer            ├─ /api/permsets         │
│  ├─ Matrix X-Ray          ├─ /api/convert          │
│  └─ Auth flow             ├─ /api/summarize        │
│                           ├─ /api/matrix           │
│                           └─ /api/audit            │
│                                                     │
│                  Database (PostgreSQL)              │
│                  ├─ profiles (cache)                │
│                  ├─ permission_sets                 │
│                  ├─ conversions (history)           │
│                  ├─ audit_log                       │
│                  └─ users                           │
│                                                     │
│              Salesforce (Metadata API)              │
│              ├─ OAuth token storage                 │
│              ├─ Profile queries                     │
│              ├─ PermissionSet queries               │
│              └─ FieldPermissions                    │
│                                                     │
│                Claude API (for AI grouping)         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Phase Breakdown

### Phase 1: Foundation (Weeks 1-2)
**Goal:** MVP with core 3 features ported, Claude AI working

**Tasks:**
- [ ] Setup Node.js + Express backend
- [ ] Setup React frontend (Vite)
- [ ] PostgreSQL schema (profiles, permsets, conversions, audit)
- [ ] Salesforce OAuth flow (Connected App setup)
- [ ] Profile query → cache in PostgreSQL
- [ ] PermissionSet query → cache
- [ ] FieldPermissions query → cache
- [ ] Claude API integration for Profile 2 Permset
- [ ] Basic React pages (Profile Converter, Summarizer, Matrix)
- [ ] Deploy frontend (Vercel), backend (Railway)

**Outcome:** Core 3 features working, connecting to a real Salesforce org

### Phase 2: Polish (Weeks 3-4)
**Goal:** Production-ready UX, audit logging

**Tasks:**
- [ ] TailwindCSS styling (light/dark mode)
- [ ] shadcn/ui components (forms, tables, dialogs)
- [ ] Audit logging (who converted what, when)
- [ ] Permission change history (track diffs)
- [ ] Loading states + error handling
- [ ] Undo/redo for Converter edits
- [ ] Save/load conversion templates
- [ ] Search & filtering in Summarizer
- [ ] Responsive design (mobile, tablet, desktop)

**Outcome:** Production-ready, polished UI

### Phase 3: Power Features (Weeks 5-7)
**Goal:** Differentiated capabilities beyond Salesforce

**Tasks:**
- [ ] Permission diff view (compare 2 PSs side-by-side)
- [ ] Heatmap visualization (Matrix X-Ray)
- [ ] Permission inheritance tree
- [ ] Bulk convert multiple profiles (job queue)
- [ ] Export as PDF/CSV
- [ ] Slack integration (alert on risky combos)
- [ ] Multi-org support (connect multiple Salesforce orgs)
- [ ] Permission search ("find all PSs that grant Apex access")
- [ ] Trend analysis (permission changes over time)

**Outcome:** Competitive advantage vs Salesforce tools

### Phase 4: Scale (Ongoing)
**Goal:** Production hardening, monitoring, reliability

**Tasks:**
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic or DataDog)
- [ ] Rate limiting (prevent abuse)
- [ ] Database query optimization
- [ ] Caching strategy (Redis)
- [ ] Load testing (k6 or Artillery)
- [ ] Security audit (OWASP top 10)

---

## Data Flow (Example: Profile 2 Permset)

```
User logs in
  ↓
Salesforce OAuth → access_token stored in PostgreSQL
  ↓
User selects Profile from dropdown
  ↓
Frontend calls /api/profiles/:id/analyze
  ↓
Backend queries Salesforce:
  - ObjectPermissions for Profile
  - FieldPermissions for Profile
  - Caches in PostgreSQL
  ↓
Send data to Claude API
  Prompt: "Group these 50 object permissions into 5 logical permission sets.
          Suggest names and descriptions."
  ↓
Claude streams back grouping suggestions
  ↓
Frontend displays cards with suggestions
  User can edit labels, descriptions, drag objects between groups
  ↓
User clicks "Convert Profile"
  ↓
Backend calls /api/convert with edited plan
  ↓
Backend creates PermissionSet records in Salesforce:
  - Calls sf.metadata.deploy() for each PermSet
  - Copies all ObjectPermissions + FieldPermissions
  - Creates PermissionSetGroup (optional)
  ↓
Backend logs conversion in PostgreSQL audit_log
  ↓
Frontend shows success page with created PermSets
```

---

## File Structure (Web App)

```
permbridge-web-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── profileController.ts
│   │   │   ├── permsetController.ts
│   │   │   ├── converterController.ts
│   │   │   └── auditController.ts
│   │   ├── services/
│   │   │   ├── salesforceService.ts
│   │   │   ├── claudeService.ts
│   │   │   └── cacheService.ts
│   │   ├── models/
│   │   │   ├── Profile.ts
│   │   │   ├── PermissionSet.ts
│   │   │   ├── AuditLog.ts
│   │   │   └── Conversion.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── profiles.ts
│   │   │   ├── permsets.ts
│   │   │   ├── converter.ts
│   │   │   └── matrix.ts
│   │   └── app.ts
│   ├── migrations/
│   │   ├── 001_create_profiles.sql
│   │   ├── 002_create_permsets.sql
│   │   ├── 003_create_audit_log.sql
│   │   └── 004_create_conversions.sql
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProfileConverter/
│   │   │   │   ├── ProfileSelector.tsx
│   │   │   │   ├── SuggestionCard.tsx
│   │   │   │   └── ConversionResult.tsx
│   │   │   ├── Summarizer/
│   │   │   │   ├── PermSetSearch.tsx
│   │   │   │   ├── SummaryTabs.tsx
│   │   │   │   └── PermissionTable.tsx
│   │   │   ├── Matrix/
│   │   │   │   ├── ObjectSelector.tsx
│   │   │   │   ├── MatrixHeatmap.tsx
│   │   │   │   └── UserPermissions.tsx
│   │   │   └── shared/
│   │   │       ├── Header.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Loading.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProfiles.ts
│   │   │   ├── usePermsets.ts
│   │   │   └── useConvert.ts
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── ConverterPage.tsx
│   │   │   ├── SummarizerPage.tsx
│   │   │   ├── MatrixPage.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── store/
│   │   │   └── appStore.ts (Zustand)
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── App.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── SALESFORCE_SETUP.md
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── deploy.yml
├── README.md
└── .gitignore
```

---

## Key Decisions

### 1. Why Claude API over Einstein?
- **Cost:** Claude $3-15/1M tokens vs Einstein $2/request for limited capacity
- **Quality:** Claude better at complex reasoning (grouping 100 perms)
- **Flexibility:** Prompt engineering, no Salesforce approval needed
- **Reliability:** Consistent API, no org-specific limitations

### 2. Why PostgreSQL over Firebase?
- **Audit trail:** Need full history of conversions + permission changes
- **Complex queries:** Permission diffs, comparisons need SQL
- **Cost:** Self-hosted or Railway is cheaper than Firebase at scale
- **Control:** Can run our own full-text search, JSON ops

### 3. Why React over Vue?
- **Ecosystem:** Better component libraries (shadcn/ui, Recharts)
- **Job market:** Easier to find help later
- **Community:** More Stack Overflow answers, examples

### 4. Why Vercel for frontend?
- **Deployment:** Git push → live in 30 seconds
- **Preview deployments:** Each PR gets a preview URL
- **Performance:** Global CDN
- **Cost:** Free tier covers early usage

### 5. Why Railway for backend?
- **Database included:** PostgreSQL + Redis in one place
- **Simple:** Deploy Docker containers, no K8s needed
- **Cost:** Affordable, pay-as-you-go
- **Developer experience:** CLI is smooth

---

## Success Metrics

### Phase 1 Completion
- [ ] Core 3 features working end-to-end
- [ ] Can connect to a real Salesforce org
- [ ] Profile 2 Permset converter uses Claude API
- [ ] Both frontend + backend deployed to production

### Phase 2 Completion
- [ ] Audit logging captures all actions
- [ ] UI is polished (TailwindCSS + shadcn)
- [ ] < 2 second page load times
- [ ] Mobile responsive

### Phase 3 Completion
- [ ] Heatmap visualization working
- [ ] Bulk convert handles 100+ profiles
- [ ] PDF/CSV export works
- [ ] Multi-org support connects 2+ orgs

### Long-term
- [ ] 1000+ users across multiple orgs
- [ ] <1% error rate on conversions
- [ ] 99.9% uptime
- [ ] Slack integration alerts firing correctly

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Salesforce API rate limits | Cache aggressively in PostgreSQL, batch queries |
| Claude API latency | Stream responses, show spinner, timeout after 30s |
| OAuth token expiration | Refresh token flow, store securely in DB |
| Breaking Salesforce API changes | Stay on one API version, monitor deprecations |
| User permissions mismatched | Comprehensive test suite, shadow mode (show but don't create) |

---

## Timeline

- **Week 1:** Backend foundation + OAuth
- **Week 2:** Frontend foundation + API integration
- **Week 3:** UI polish + Audit logging
- **Week 4:** Testing + bug fixes
- **Week 5+:** Power features (diff, heatmap, bulk convert)

**Full MVP: ~4 weeks**

---

## Questions to Answer Before Starting

1. **Salesforce org:** Which org should we test with? (sandbox or production?)
2. **Budget:** Any cloud cost constraints? (Vercel + Railway ~$50-200/month early)
3. **Feature priority:** In Phase 3, should we prioritize heatmap or multi-org first?
4. **Timeline:** Is 4 weeks acceptable for MVP, or do you need it faster?
5. **Team:** Who's building? (You + contractors, or just you?)

---

**Next:** Create Salesforce Connected App → Setup local dev environment → Start Phase 1
