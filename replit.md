# طبيبي (ClinicOS)

Arabic-first clinic management web app.

## Stack
- Frontend: React + Vite (`artifacts/clinic-app`), Tailwind v4, wouter, TanStack Query, Cairo/Tajawal fonts, RTL
- Backend: Express + Drizzle + PostgreSQL (`artifacts/api-server`), JWT in httpOnly cookies, bcrypt
- Contract: OpenAPI in `lib/api-spec` → orval generates `@workspace/api-client-react` + `@workspace/api-zod`
- Deploy: single Railway service (Express serves built React in prod) — see `RAILWAY_DEPLOYMENT.md`

## Auth
- `/login`, `/signup` are public; everything else is protected by `ProtectedRoute` + `AuthProvider`
- Demo creds: `doctor@clinic.com` / `demo1234`
- Doctor profile includes `clinicName` (shown in sidebar + dashboard greeting)

## Localization
- Entire UI is in Arabic with RTL layout (`<html lang="ar" dir="rtl">`)
- All strings live in `artifacts/clinic-app/src/lib/i18n.ts` (also exposes `formatDateAr`, `formatDateShortAr`, `monthShortAr`)
- Sidebar is on the right; FAB at bottom-left; emails/phones/times use `dir="ltr"`

## Design system
- Brand: teal/emerald medical palette via `--primary 168 76% 38%` and `--sidebar 195 70% 14%`
- Utilities: `.gradient-brand`, `.gradient-brand-soft`, `.text-gradient-brand`, `.glass-card`
- Cards use `border-0 shadow-md` for a modern feel; rounded-2xl/3xl throughout

## Codegen
- After editing `lib/api-spec/openapi.yaml`: `pnpm --filter @workspace/api-spec run codegen`
- ⚠️ Orval regenerates `lib/api-zod/src/index.ts` with broken refs — always overwrite to:
  `export * from "./generated/api";`

## Production serving
`artifacts/api-server/src/app.ts` serves `artifacts/clinic-app/dist` and falls back to `index.html` for SPA routes when `NODE_ENV=production`.
