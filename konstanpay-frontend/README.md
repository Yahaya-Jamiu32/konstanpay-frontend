# KonstanPay – Frontend

React 18 + Vite + React Router + Bootstrap 5 (JavaScript, no TypeScript/Tailwind). Handoff-ready frontend; **no backend included**.

## Run
```bash
npm install
cp .env.example .env     # VITE_API_MODE=mock by default
npm run dev              # http://localhost:5173
npm run build            # output in dist/ (static hosting; SPA fallback to index.html required)
```
Development logins (mock data layer only): `muhammad@gmail.com` / `md2442`, admin `admin@konstanpay.demo` / `Admin@1234`, verification code `123456`.

## Deploy (Vercel)
See `docs/DEPLOY.md`. `vercel.json` is included (SPA rewrite, caching, security headers). The staging (test-data) default is built into `vite.config.js`, so the first deploy works with no configuration; **set `VITE_API_MODE=live` before release**.

## Mock vs live
- `VITE_API_MODE=mock` – browser-only stand-in for the backend (`src/services/mock.js`) so the UI can be developed without an API. **A production build (`npm run build`) refuses to run in mock mode** and shows a "Service unavailable" screen.
- `VITE_API_MODE=live` – real API via `src/services/live.js` + `src/services/http.js`. Set `VITE_API_BASE_URL` (or use the dev proxy: `DEV_API_PROXY_TARGET`).
- **Backend developer: start with `docs/API_CONTRACT.md`.** Remove `mock.js` (and the `mock` import in `services/index.js`) before production if desired.
- The app never falls back from live to mock automatically.

## Structure
```
public/            logos extracted from the supplied KonstanPay artwork
src/services/      http.js (client), live.js (real API), mock.js (demo), index.js (switch)
src/context/       AuthContext (session state)
src/hooks/         useApi (loading/error/reload)
src/components/    Layout (sidebar + mobile tabs + route guard), ui, Icon, Visuals (charts/art), AuthShell, QuoteFlow
src/pages/         one file per screen
src/styles/        theme.css (design tokens on Bootstrap)
docs/              API_CONTRACT.md
```

## Status
**Implemented screens (UI follows the supplied mockups):** onboarding, login, register, phone verification (6-box OTP), forgot/reset password, dashboard (mobile + desktop), portfolio, asset detail, buy crypto, convert, swap (live quote, countdown, preview), wallet + deposit, bank & crypto withdrawal, bank accounts, bill payments (service tiles, customer verification, summary panel), history + receipt, notifications, profile, security, identity verification, support, admin (overview, users, KYC review, transactions, audit log).
**Not built:** admin support replies, admin system settings, document upload, real-time updates, 2FA, tests.

## Known limitations
- **This project was written without running `npm install` or a build** (the authoring environment had no network). Expect to fix minor issues on first run; please report/fix any build errors.
- Bootstrap 5 JS (modals etc.) is not imported; only its CSS is used.
- Client-side checks are convenience only; the backend is the source of truth for money, limits and permissions.
- Not production-ready: no licensing/compliance claims are made; needs provider integrations, security review and legal sign-off.
