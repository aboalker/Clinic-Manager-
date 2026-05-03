# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Clinic management web app (ClinicOS) for doctors.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: JWT stored in httpOnly cookies (bcrypt password hashing)

## Artifacts

- **clinic-app** (`/`) — React + Vite frontend clinic management app
- **api-server** (`/api`) — Express backend API

## Demo Credentials

- Email: `doctor@clinic.com`
- Password: `demo1234`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## DB Schema

- `doctors` — doctor accounts with bcrypt-hashed passwords
- `patients` — patient records (name, age, contact, blood type, notes, last visit)
- `appointments` — appointments linked to patients (date, time, reason, status: confirmed|pending|cancelled)

## Auth Flow

JWT stored in httpOnly cookie (`token`), 7-day expiry. Protected routes require valid JWT via `requireAuth` middleware.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
