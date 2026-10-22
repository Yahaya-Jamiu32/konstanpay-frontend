# Deploying the frontend to Vercel

The app is a static Vite build (`npm run build` → `dist/`). `vercel.json` already contains the single-page-app rewrite, caching and security headers.

## 1. First deploy (works out of the box)
1. Push the project to GitHub/GitLab/Bitbucket. Make sure `vite.config.js` is included. Commit the `package-lock.json` that `npm install` creates.
2. Vercel → **Add New → Project** → import the repo. If the repo root is the parent folder, set **Root Directory** to `konstanpay-frontend`. Framework preset: **Vite** (auto-detected).
3. Click **Deploy**. No settings are needed: `vite.config.js` defaults to the built-in test data, and the build log prints a **"STAGING BUILD"** warning. If you do not see that line in the build log, Vercel is not building this version of the code.
4. Sign in with the development logins from the README.
5. Turn on **Deployment Protection** (Project → Settings → Deployment Protection) or keep the link private, because the app is running on fake data.

If you still see "Service unavailable": (a) in Vercel → Settings → Environment Variables, delete any `VITE_API_MODE=live` you added, and (b) redeploy from the latest commit (Deployments → ⋯ → Redeploy, untick "Use existing Build Cache").

### Going live (required before real users)
Set `VITE_API_MODE=live` (Vercel dashboard variable or `.env.production`), set `VITE_API_BASE_URL=/api`, connect the backend (section 2) and redeploy.

## 2. Connect the real backend (recommended: same-origin proxy)
Add this rewrite **above** the catch-all in `vercel.json` (replace the host):
```json
{ "source": "/api/:path*", "destination": "https://api.yourdomain.com/api/:path*" }
```
The browser then talks only to your Vercel domain, so the httpOnly session cookie and CSRF token work without CORS. Keep `VITE_API_BASE_URL=/api`.

**Cross-origin alternative:** set `VITE_API_BASE_URL=https://api.yourdomain.com/api`, add that origin to `connect-src` in the CSP header in `vercel.json`, and configure the backend for CORS with credentials and `SameSite=None; Secure` cookies.

The Google sign-in button navigates to `<API base>/auth/google`; register the Vercel domain's callback in the Google OAuth console.

## 3. Domain and checks
- Project → Settings → Domains → add your domain (HTTPS is automatic).
- After deploy open the browser console; any CSP violation names the blocked URL to add to the header.
- Deep links (e.g. `/transactions/123`) and refresh must work (handled by the rewrite).
- Build settings: Node 18.18+ (set in `package.json` engines).

## Environment variables are public
Anything starting with `VITE_` is bundled into public JavaScript. Never put secrets, provider keys or database credentials in them.
