# DSC GIETU — Data Science Club, GIET University

Full-stack monorepo for the Data Science Club website.

## Structure

```
DS_ClubOfficial/
├── client/          # React Frontend (Vite + TypeScript)
├── server/          # Node.js + Express Backend
├── supabase/        # Database Layer (migrations, seeds, config)
├── .gitignore
├── docker-compose.yml
├── README.md
└── package.json     # Root scripts
```

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Run both client & server in dev mode
npm run dev

# Or run individually
npm run dev:client   # http://localhost:3000
npm run dev:server   # http://localhost:5000
```

## Client

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS** (CDN) + **Framer Motion** + **Lucide Icons**
- Hash-based routing with lazy-loaded pages

## Server

- **Express** + **TypeScript**
- **Supabase** client for database access
- Runs on port `5000` by default

## Database (Supabase)

- Migrations in `supabase/migrations/`
- Seed data in `supabase/seed.sql`
- Config in `supabase/config.toml`

## Environment Variables

### Client (`client/.env`)
```
GEMINI_API_KEY=your_key_here
```

### Server (`server/.env`)
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLIENT_URL=http://localhost:3000
```

---
*Last updated: 2026-03-15*
