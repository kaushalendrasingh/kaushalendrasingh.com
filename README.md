# kaushalendrasingh.com — Portfolio (Full‑Stack)

A polished, fast, and extensible portfolio to showcase **projects**, **profile**, **resume**, and **all your work**.

**Stack**
- Frontend: React + TypeScript + Vite + TailwindCSS + React Router + TanStack Query (React Query)
- Animations: Framer Motion
- Backend: FastAPI (Python 3.11) + SQLAlchemy 2.x + Pydantic v2
- Database: PostgreSQL
- Auth for Admin APIs: X-API-Key header (simple, env-based)
- Infra: Docker Compose (Postgres + API), CORS ready for local dev and prod domain

**Key Features**
- Dynamic projects grid (filters, tags, featured)
- Profile card (avatar, headline, bio, links, skills, resume button)
- Admin form (in `/admin`) to add/update projects (protected by API key)
- RESTful API to read/write portfolio content
- Ready for deployment to any platform that supports Docker + Postgres

---

## Quickstart

### 1) Environment
Copy envs and edit secrets:
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

Set:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (top-level `.env` for docker-compose)
- `DATABASE_URL`, `ADMIN_API_KEY`, `ALLOWED_ORIGINS` (API `.env`)

### 2) Run database + API
```bash
docker compose up --build
```
This starts:
- Postgres at `localhost:5432`
- API at `http://localhost:8000` (docs: `/docs`)
API auto-creates tables on first run.

### 3) Frontend (web)
```bash
cd apps/web
npm i
npm run dev
```
Open `http://localhost:5173`

> Default API URL is `http://localhost:8000`; change via `VITE_API_URL` in `apps/web/.env`.

### 4) Admin: add a project
Go to `http://localhost:5173/admin`, enter your **API key** and details, submit.
Or use curl:
```bash
curl -X POST http://localhost:8000/projects \
  -H "Content-Type: application/json" -H "X-API-Key: $ADMIN_API_KEY" \
  -d '{"title":"Demo","description":"Test","tags":["react"],"tech_stack":["react","ts"],"github_url":"https://github.com/kaushal/demo"}'
```

---

## Monorepo Layout
```
.
├─ apps/
│  ├─ api/           # FastAPI + SQLAlchemy + Postgres
│  └─ web/           # React + TS + Vite + Tailwind
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

### API Highlights
- `GET /health`
- `GET /profile`, `PUT /profile` (admin)
- `GET /projects`, `GET /projects/{id}`
- `POST /projects`, `PUT /projects/{id}`, `DELETE /projects/{id}` (admin)
- `GET /tags`
- OpenAPI docs at `/docs`

### Production Notes
- Put API and DB behind a reverse proxy (Nginx/Caddy) with HTTPS
- Serve frontend (static build) on a CDN / static host
- Use stronger auth (JWT/OAuth) if you need multi-user admin
- Add Alembic migrations once schema stabilizes

---

## Master Prompt (for AI tools like Copilot/ChatGPT)
Copy this into your AI tool to extend the project:

```
You are coding a full-stack portfolio app for "kaushalendrasingh.com".
**Requirements:**
- Frontend: React + TypeScript + Vite + TailwindCSS, React Router, TanStack Query, Framer Motion.
- Backend: FastAPI, SQLAlchemy 2.x, Pydantic v2, PostgreSQL.
- Admin auth: X-API-Key header (env: ADMIN_API_KEY).
- Features:
  1) Home page with hero, profile card (avatar, headline, bio, location, years_experience, social links), skills badges, CTA buttons (View Resume, Contact).
  2) Projects grid with filters by tag/tech, featured spotlight, search by title.
  3) Project detail modal/page (cover image, gallery, description, role, outcomes, links: live, GitHub).
  4) Resume link (hosted URL), contact links.
  5) Admin route (/admin) with form to create/update projects; use React Query mutations.
  6) API endpoints: GET/POST/PUT/DELETE projects; GET/PUT profile; GET tags; health check.
  7) Responsive, accessible UI (Tailwind), subtle motion (Framer Motion), SEO basics (meta tags).
- Non-functional:
  - Code quality: ESLint + Prettier; strict TS types; error boundaries.
  - Security: CORS restricted via env; admin-only writes; input validation; rate limit (optional).
  - Deployment: Docker Compose (Postgres + API). Frontend built via `npm run build` and served statically.
**Deliverables:**
- Production-ready components and API code with docs.
- Tests (optional): unit tests for utils/components; API tests with httpx/pytest.
**Acceptance Criteria:**
- I can run: `docker compose up` (db+api) and `npm run dev` (web) and add a project via `/admin` and see it on `/`.
```
