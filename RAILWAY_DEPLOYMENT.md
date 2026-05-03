# Railway Deployment Guide — طبيبي (ClinicOS)

This monorepo is configured to deploy as a **single Railway service** that serves both the API and the built React frontend.

## How it works

1. The build step generates the OpenAPI client + zod schemas, builds all internal libs, builds the React app (`artifacts/clinic-app`), and bundles the Express server (`artifacts/api-server`).
2. The Express server serves the static frontend from the built clinic-app and exposes the JSON API under `/api`.
3. PostgreSQL is provided by the Railway Postgres plugin via `DATABASE_URL`.

## Required environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (auto-provided by Railway Postgres plugin) |
| `JWT_SECRET` | Long random string used to sign auth cookies — generate with `openssl rand -base64 64` |
| `NODE_ENV` | Set to `production` |
| `PORT` | Set automatically by Railway |

See `.env.example` for the full list.

## Deploy in 3 steps

1. **Create a new project on Railway** and connect this Git repository.
2. **Add the PostgreSQL plugin** — `DATABASE_URL` will be injected automatically.
3. **Set the secrets** above (`JWT_SECRET` and `NODE_ENV=production`) in the Railway service variables.

Railway will use `railway.json` + `nixpacks.toml` to build and start the service. The healthcheck pings `/api/healthz`.

## Pushing the database schema

After the first deployment (or whenever the schema changes), run the schema push from your local machine pointed at the production `DATABASE_URL`:

```bash
DATABASE_URL=<your-railway-prod-url> pnpm --filter @workspace/db run push
```

## Local testing of the production build

```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/clinic-app run build
pnpm --filter @workspace/api-server run build
node artifacts/api-server/dist/index.mjs
```
