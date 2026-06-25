# Study XP

> Turn your study sessions into quests. Earn XP, level up, build streaks, and unlock badges — all by just doing the work.

**Study XP** is a gamified study tracker for students. It wraps everyday homework and revision tasks in an RPG-style progression system to make studying more motivating and consistent.

**Live Demo:** https://study-quest--nprusty970.replit.app/

---

## Screenshots
### Landing Page
![Landing Page](./landing-page.png)

### Dashboard
![Dashboard](./dashboard.png)

### Quests
![Quests](./quest.png)

### Badges
![Badges](./badges.png)

## Features

- **XP & Leveling** — every completed task awards XP; accumulate enough to level up
- **Daily Streaks** — consecutive study days tracked; miss a day and the streak resets
- **Achievement Badges** — 13 unique badges across four categories: Streak, Tasks, XP, and Level milestones
- **Quest Management** — create tasks with title, subject, due date, and priority (Low / Medium / High); higher priority = more XP
- **Subject Organisation** — categorise quests by subject (Math, Physics, History, Literature, Computer Science, or custom)
- **Progress Dashboard** — live XP bar, today's XP, weekly activity chart, and per-subject breakdown
- **Demo Mode** — try the full app without creating an account

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Animation | Framer Motion |
| Charts | Recharts |
| Routing | Wouter |
| Backend | Express 5, Node.js 24 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4, drizzle-zod |
| API Contract | OpenAPI 3 + Orval codegen |
| Package Manager | pnpm workspaces |

---

## Project Structure

```
study-xp/
├── artifacts/
│   ├── study-xp/           # React + Vite frontend (proxied at /)
│   │   └── src/
│   │       ├── pages/      # landing, dashboard, tasks, badges, subjects, settings
│   │       ├── components/ # layout, sidebar, UI primitives (shadcn)
│   │       └── lib/        # auth context, API client helpers
│   └── api-server/         # Express 5 API (proxied at /api)
│       └── src/
│           ├── routes/     # profile, tasks, subjects, badges, stats
│           └── index.ts    # server entry, middleware, route registration
├── lib/
│   ├── db/                 # Drizzle schema, migrations, seed data
│   ├── api-spec/           # OpenAPI 3 spec + Orval config (source of truth)
│   ├── api-zod/            # Generated Zod schemas (do not edit manually)
│   └── api-client-react/   # Generated React Query hooks (do not edit manually)
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [pnpm 9+](https://pnpm.io) — `npm install -g pnpm`
- A PostgreSQL database (local or cloud)

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/study-xp.git
cd study-xp
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set environment variables

Create a `.env` file in the project root (never commit this file):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/study_xp
SESSION_SECRET=replace-with-a-long-random-string
```

### 4. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

This applies the Drizzle schema to your database and seeds the badge definitions and default subjects.

### 5. Start the API server

```bash
pnpm --filter @workspace/api-server run dev
```

The API listens on **port 8080** and is available at `/api`.

### 6. Start the frontend

```bash
pnpm --filter @workspace/study-xp run dev
```

The frontend is served by Vite and available at **port 5173** (or whatever `PORT` is set to).

Open [http://localhost:5173](http://localhost:5173) to see the landing page.

---

## API Reference

All endpoints are prefixed with `/api`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/profile` | Fetch user profile (XP, level, streak, name) |
| `PATCH` | `/api/profile` | Update name or reset progress |
| `GET` | `/api/tasks` | List all tasks |
| `POST` | `/api/tasks` | Create a new task |
| `PATCH` | `/api/tasks/:id` | Update or complete a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `GET` | `/api/subjects` | List all subjects |
| `POST` | `/api/subjects` | Create a subject |
| `GET` | `/api/badges` | List all badges with unlock status |
| `GET` | `/api/stats` | Aggregated stats (weekly XP, subject breakdown) |

The full contract lives in [`lib/api-spec/openapi.yaml`](lib/api-spec/openapi.yaml).

---

## Development Workflow

### Regenerate API hooks after changing the OpenAPI spec

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates Zod schemas in `lib/api-zod` and React Query hooks in `lib/api-client-react`. Never edit those files by hand.

### Full typecheck

```bash
pnpm run typecheck
```

### Build all packages

```bash
pnpm run build
```

---

## XP & Leveling Formula

| Concept | Formula |
|---|---|
| Level from XP | `floor(sqrt(totalXP / 100)) + 1` |
| XP threshold for level *n* | `(n - 1)² × 100` |
| XP per task | Low: 25 XP · Medium: 50 XP · High: 100 XP |
| Streak bonus | +10 XP per day on a streak ≥ 3 days |

---

## Badge Catalogue

| Category | Badges |
|---|---|
| Streak | First Flame, Week Warrior, Month Master |
| Tasks | Quest Starter, Task Master, Century Club |
| XP | XP Initiate, XP Adventurer, XP Legend |
| Level | Level 5 Reached, Level 10 Reached, Level 20 Reached |
| Special | Early Adopter |

---

## Architecture Decisions

- **Contract-first API** — the OpenAPI spec in `lib/api-spec` is the single source of truth. Zod schemas and React Query hooks are generated from it; both the server and client stay in sync automatically.
- **Path-based proxy routing** — a global reverse proxy routes `/api/*` to the Express server and `/*` to the Vite frontend. No CORS configuration is needed in development or production.
- **Single profile model** — the app is designed as a single-user tracker (one profile row). Multi-user auth can be added by scoping all queries to a `userId` foreign key.
- **Drizzle over raw SQL** — schema changes are expressed in TypeScript and applied via `drizzle-kit push`, keeping the schema and types co-located and type-safe.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

Please run `pnpm run typecheck` before submitting.

---

## License

MIT — see [LICENSE](LICENSE) for details.
