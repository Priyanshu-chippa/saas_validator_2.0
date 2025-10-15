## SaaSInsight Operational Manual

Project path:
- Windows path: `C:\Users\priya\Downloads\saas-idea-insights-main\saas-idea-insights-main`
- Frontend entry: `src/main.tsx`, routes in `src/App.tsx`
- Supabase Edge Function: `supabase/functions/validate-idea/index.ts`
- Env file (frontend): `.env` in project root

Run locally
- Open Command Prompt (cmd.exe)
- cd C:\Users\priya\Downloads\saas-idea-insights-main\saas-idea-insights-main
- Stop any stuck node: `taskkill /F /IM node.exe`
- Install deps: `npm install`
- Start dev: `npm run dev` (open the printed URL, usually http://localhost:5173)
- Force port 8080: `npx vite --host --port 8080` (open http://localhost:8080)
- Build + preview: `npm run build` then `npx vite preview --host --port 8080`

Frontend env vars (.env)
- `VITE_SUPABASE_URL=https://<project-ref>.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<anon key>`
- `VITE_FUNCTIONS_URL=https://<project-ref>.supabase.co/functions/v1`
- After editing `.env`, restart dev server.

Supabase Edge Function
- Project ref: `ahrcjezwjedgesjaclkb` (owner: Priyanshu-chippa)
- Function: `validate-idea`
- Secrets required: `GEMINI_API_KEY`, `SERPAPI_API_KEY`
- Link project (once): `npx supabase link --project-ref ahrcjezwjedgesjaclkb`
- Set secrets: `npx supabase secrets set GEMINI_API_KEY=... SERPAPI_API_KEY=...`
- Deploy: `npx supabase functions deploy validate-idea --no-verify-jwt --project-ref ahrcjezwjedgesjaclkb`
- Logs: Supabase Dashboard → Edge Functions → validate-idea → Invocations → click a request → Raw

Model used (as configured)
- Google Generative Language API model: `gemini-2.0-flash` (v1 endpoint)
- If your key supports different models, update the model string in `supabase/functions/validate-idea/index.ts` (`callGeminiWithFallback`).

Playbooks (what to do if X happens)

1) Supabase project paused or suspended
- Symptom: Frontend requests 401/403/404/5xx from `.../functions/v1/validate-idea`.
- Action:
  - Resume the project in Supabase Dashboard → General.
  - Wait ~1–3 minutes for services to warm up.
  - Re-test via browser DevTools Network or run:
    - PowerShell: `$body = @{ ideaDescription = 'Diagnostic placeholder text to satisfy length' } | ConvertTo-Json -Compress; Invoke-RestMethod -Method Post -Uri 'https://<project-ref>.supabase.co/functions/v1/validate-idea' -ContentType 'application/json' -Body $body`
  - If still failing, redeploy the function (deploy command above).

2) Gemini API key hits limits or becomes invalid
- Symptoms: 429/400 or 404 model NOT_FOUND in function error body.
- Action:
  - Generate a new API key in Google AI Studio (Generative Language API).
  - Verify available models: `Invoke-RestMethod 'https://generativelanguage.googleapis.com/v1/models?key=NEW_KEY'` and look for names with `supportedGenerationMethods` including `generateContent`.
  - Set secret: `npx supabase secrets set GEMINI_API_KEY=NEW_KEY`
  - If needed, update model in function to one returned, e.g. `gemini-2.5-flash`.
  - Redeploy the function.

3) SerpApi limits reached
- Symptoms: SEO section empty; function still returns 200.
- Action: Keep using; related searches may be empty until quota resets or upgrade plan / change key via `npx supabase secrets set SERPAPI_API_KEY=...`.

4) Frontend shows blank page or wrong port
- Symptom: Opening http://localhost:8080 but Vite served http://localhost:5173.
- Action: Use the URL printed by `npm run dev`. To force 8080, run `npx vite --host --port 8080`.

5) “vite is not recognized” or module errors
- Action: `taskkill /F /IM node.exe`, then `npm install`, then `npm run dev`.

6) Quick health check endpoint (diagnostics mode)
- You can POST with `{ debug: true, ideaDescription: 'Diagnostic placeholder text to satisfy length' }` to the function to receive diagnostics for Gemini and SerpApi.

Safe changes & where to edit
- Change model: `supabase/functions/validate-idea/index.ts` in `callGeminiWithFallback` candidates.
- Frontend API URL: `src/pages/Index.tsx` reads from `VITE_FUNCTIONS_URL`.
- Supabase client: `src/integrations/supabase/client.ts` uses Vite envs.

Notes for myself 
- CORS headers are permissive; switching frontend host (Vercel/Netlify/Cloudflare) works without changes.
- secrets are kept in Supabase, not in the repo. Rotate if leaked.
- supbase priyanshu 
- Ai studio trialeverything

---

Advanced troubleshooting (more things that can break)
- Browser cache or stale service worker
  - Hard reload: Ctrl+Shift+R (or Ctrl+F5). Clear cache if UI seems stuck.
- Mixed environment (PowerShell vs cmd)
  - Use cmd.exe for chained commands and the exact commands in this manual.
- Windows file locks on node_modules
  - Close editors/terminals using the folder, then: `taskkill /F /IM node.exe` → `rmdir /S /Q node_modules` → `npm install`.
- Function cold starts / timeouts
  - First call after pause can take a few seconds. Retry once before assuming failure.
- Large prompts / responses
  - Gemini has token limits; extremely long ideas may 400/413. Keep inputs concise.
- CORS/Origin
  - Our function allows `*` via corsHeaders; if you ever restrict it, add your frontend origin(s).
- Clock/time skew
  - Rare auth header problems can occur if system time is far off. Sync system time.
- Network blocks/Ad blockers
  - Some extensions block `*.supabase.co` or `serpapi.com`. Try an incognito window.

CI tips for deployments
- Pin Node in CI to Node 18+ (Vite 5 requires): set Node version in Netlify/Cloudflare/CI as 18 or 20.
- Always set env vars in the hosting provider (never hardcode keys).

Runbook quick links
- Local dev: see "Run locally"
- Rotate Gemini key: see Playbook #2
- Resume Supabase: see Playbook #1
- Re-deploy function: see "Supabase Edge Function"
- Diagnostics call: see Playbook #6

---

Deploy commands (copy/paste)
- Supabase Edge Function (backend)
  1) Link once: `npx supabase link --project-ref ahrcjezwjedgesjaclkb`
  2) Set/rotate secrets: `npx supabase secrets set GEMINI_API_KEY=YOUR_KEY SERPAPI_API_KEY=YOUR_KEY`
  3) Deploy function: `npx supabase functions deploy validate-idea --no-verify-jwt --project-ref ahrcjezwjedgesjaclkb`
  4) Test quickly (PowerShell):
     - `$body = @{ ideaDescription = 'Diagnostic placeholder text to satisfy length' } | ConvertTo-Json -Compress`
     - `Invoke-RestMethod -Method Post -Uri 'https://ahrcjezwjedgesjaclkb.supabase.co/functions/v1/validate-idea' -ContentType 'application/json' -Body $body`

- Frontend (choose ONE free host)
  - Netlify (UI): set env vars, Build: `npm run build`, Publish dir: `dist` → Deploy
  - Netlify (CLI): `npm run build` → `npx netlify deploy --prod --dir=dist` (run `npx netlify login && npx netlify init` first)
  - Cloudflare Pages (UI): connect Git, set env vars, Build: `npm run build`, Output: `dist`
  - Cloudflare Pages (CLI): `npm run build` → `npx wrangler pages deploy dist --project-name saasinsight` (run `npx wrangler login` first)

Playbook: Gemini API limits/key rotation (step-by-step)
- Symptoms you might see:
  - 429 RESOURCE_EXHAUSTED / rate limit
  - 400 API_KEY_INVALID
  - 404 NOT_FOUND (model not available for your key)
  - 5xx upstream errors
- Zero-downtime steps:
  1) Create a new API key in Google AI Studio (Generative Language API). Keep the old one in place until the new key is validated.
  2) Verify which models the new key supports:
     - PowerShell: `Invoke-RestMethod "https://generativelanguage.googleapis.com/v1/models?key=NEW_KEY" | ConvertTo-Json -Depth 6`
     - Note any model with `supportedGenerationMethods` including `generateContent` (e.g., `models/gemini-2.0-flash`, `models/gemini-2.5-flash`).
  3) Update Supabase secret (no code change yet):
     - `npx supabase secrets set GEMINI_API_KEY=NEW_KEY`
  4) If the supported model differs from `gemini-2.0-flash`, update the function:
     - File: `supabase/functions/validate-idea/index.ts`
     - In `callGeminiWithFallback`, set the single candidate string to your available model (e.g., `gemini-2.5-flash`).
  5) Redeploy:
     - `npx supabase functions deploy validate-idea --no-verify-jwt --project-ref ahrcjezwjedgesjaclkb`
  6) Test diagnostics (optional):
     - POST `{ "debug": true, "ideaDescription": "Diagnostic placeholder text to satisfy length" }` to the function and confirm `{ diagnostics: { gemini.ok: true, serp.ok: true } }`.

Additional playbooks
- Supabase project paused/suspended (public site down)
  - Resume project in Supabase Dashboard → General → Resume, wait 1–3 minutes.
  - Re-test function; if needed, redeploy.
- Secrets rotation (SerpApi/Gemini) without downtime
  - Add new secret first → deploy → test → remove old key later.
- Docker requirement during CLI deploy
  - Newer CLI supports remote bundling; if you see Docker errors, start Docker Desktop or update CLI to latest (`npx supabase update`).
- .env drift on frontend host
  - If your site shows 404/500 on validate, re-check host env vars match local `.env`.
- Large inputs causing 400/413
  - Keep idea descriptions concise; split long descriptions.
- Regional latency
  - Supabase project region: ap-south-1. If most users are far away, expect extra latency on first call.



------------------------------------------------------------------------------------------------------------------------------

  MY NOTES


  Short answers first:
- Use Cloudflare Pages for free frontend hosting; Supabase hosts the backend. No extra login for visitors.
- Run rotation and deploy commands in your project folder: C:\Users\priya\Downloads\saas-idea-insights-main\saas-idea-insights-main (in cmd.exe).
- Changing API keys (Gemini/SerpApi) does NOT require redeploy. Just set secrets again; the next request uses them.
- Changing the model currently requires a tiny code edit + redeploy. If you want “no redeploy”, I can add a GEMINI_MODEL secret read.

Recommended hosting
- Frontend: Cloudflare Pages (free, fast, simple)
- Backend: Supabase Edge Functions (already deployed)

Where to run each command
- Project folder (cmd.exe): git, build, local dev (npm), Cloudflare CLI (wrangler), Supabase CLI (link is easier here too)

Daily operations cheat-sheet
- Rotate Gemini/SerpApi keys (no redeploy needed)
  - In cmd.exe at project root:
    - npx supabase secrets set GEMINI_API_KEY=NEW_KEY
    - npx supabase secrets set SERPAPI_API_KEY=NEW_KEY
  - Test: Use the diagnostics POST from MANUAL.md. Keys take effect immediately on next request.

- Change model (current code)
  - Edit supabase/functions/validate-idea/index.ts → set model in callGeminiWithFallback to e.g. 'gemini-2.5-flash'
  - Deploy: npx supabase functions deploy validate-idea --no-verify-jwt --project-ref ahrcjezwjedgesjaclkb
  - If you want this “no redeploy”: I can add support for a GEMINI_MODEL secret; then you’d just run
    - npx supabase secrets set GEMINI_MODEL=gemini-2.5-flash
    - No code change; next request uses new model.

- Resume a paused Supabase project
  - Supabase Dashboard → Project → Resume. Wait 1–3 minutes. If needed:
    - Re-deploy the function (same deploy command).
    - Re-test diagnostics POST.

- If the website is down (how to find the issue)
  - Step 1: Browser DevTools → Network → POST /functions/v1/validate-idea → read status code and response JSON error.
  - Step 2: Supabase Dashboard → Functions → validate-idea → Invocations → click latest POST → Raw → copy error message.
  - Step 3: If secrets issue, rerun secrets set (above). If model NOT_FOUND, change model (or ask me to enable GEMINI_MODEL secret).
  - Step 4: If SerpApi quota, report still returns (SEO may be empty). If Gemini quota, rotate Gemini key (secrets set) and test again.
  - Step 5: If frontend env wrong, re-check .env and rebuild/deploy.

Local run and change code
- cmd.exe:
  - cd C:\Users\priya\Downloads\saas-idea-insights-main\saas-idea-insights-main
  - taskkill /F /IM node.exe
  - npm install
  - npm run dev (open the printed URL, usually http://localhost:5173)
  - Force 8080: npx vite --host --port 8080
- Build and preview:
  - npm run build
  - npx vite preview --host --port 8080

Deploy (pick one free path)
- Cloudflare Pages (recommended)
  - Connect Git repo in Cloudflare Pages
  - Build command: npm run build
  - Output: dist
  - Environment variables:
    - VITE_SUPABASE_URL=https://ahrcjezwjedgesjaclkb.supabase.co
    - VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
    - VITE_FUNCTIONS_URL=https://ahrcjezwjedgesjaclkb.supabase.co/functions/v1
  - Deploy → public pages.dev URL

- Netlify (alternative)
  - Build: npm run build; Publish dir: dist
  - Same 3 env vars; Deploy → netlify.app URL

Push to a new GitHub repo (project root, cmd.exe)
- git init
- git add .
- git commit -m "Initial working version (Supabase + Gemini 2.0 flash)"
- git branch -M main
- git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
- git push -u origin main

Extra playbooks you’ll care about
- Vite blank/port mismatch: use the URL Vite prints (5173). To force 8080: npx vite --host --port 8080
- “vite is not recognized”: taskkill /F /IM node.exe → npm install → npm run dev
- File locks on Windows: close editors/terminals; taskkill node; delete node_modules; npm install
- Very long idea input: keep it concise to avoid model 400/413
- Extensions blocking requests: try incognito; some block *.supabase.co or serpapi.com

If you want no-redeploy model changes
- Say “add GEMINI_MODEL secret.” I’ll update the function to read GEMINI_MODEL so you can switch models with:
  - npx supabase secrets set GEMINI_MODEL=gemini-2.5-flash
- Then you won’t need to edit code or redeploy for model changes.

You’ve got `MANUAL.md` in the project root with all commands and links. If you want, I can also add a one-click /health page in the UI to run diagnostics and show green/red for each dependency.

---

Recommended free, no-login, always-online setup

Go with this setup for a free, no-login, always-online site that updates automatically:

- Frontend (static): Cloudflare Pages connected to your GitHub repo
- Backend (API): Supabase Edge Function (already deployed)
- Source of truth: GitHub main branch (Cloudflare auto‑deploys on push)
- Secrets/keys: stored in Supabase and Cloudflare Pages env, not hardcoded

Why this is best
- Site is public on the internet (no login for visitors).
- Your PC can be off; Cloudflare serves the built files.
- Updating code is just “git push” → auto deploy.
- Rotating Gemini/SerpApi keys doesn’t require redeploy of the frontend; backend picks up new secrets immediately.

One‑time setup
1) Push your project to GitHub (you already did).
2) Cloudflare Pages (UI):
   - Create → Connect to github → select repo.
   - Framework preset: Vite
   - Build command: npm run build
   - Output directory: dist
   - Environment variables (Production):
     - VITE_SUPABASE_URL = https://ahrcjezwjedgesjaclkb.supabase.co
     - VITE_SUPABASE_ANON_KEY = YOUR_ANON_KEY
     - VITE_FUNCTIONS_URL = https://ahrcjezwjedgesjaclkb.supabase.co/functions/v1
   - Deploy. You’ll get a pages.dev URL (add a custom domain later if you want).

3) Supabase (done already, keep these handy):
   - Project ref: ahrcjezwjedgesjaclkb
   - Function: validate-idea
   - Secrets: GEMINI_API_KEY, SERPAPI_API_KEY

Daily operations (minimal work)
- Change code (UI or function) → commit → git push → Cloudflare redeploys frontend. If you changed function code, run one command to redeploy it.
- Rotate keys (no redeploy):
  - Supabase: npx supabase secrets set GEMINI_API_KEY=NEW SERPAPI_API_KEY=NEW
  - Cloudflare (frontend): set the three VITE_ envs in Pages → Settings → Environment variables (only if you changed URLs/anon key)
- Optional: I can switch backend to read GEMINI_MODEL from a secret so model changes don’t need code edits/redeploy. Just say “enable GEMINI_MODEL”.

If the site goes down (fast triage)
- In browser DevTools → Network → POST /functions/v1/validate-idea: read status + response.
- Supabase Dashboard → Functions → validate-idea → Invocations → click latest → Raw error explains cause (model, quota, secret).
- Fixes:
  - Supabase paused: Resume in Dashboard, wait 1–3 minutes.
  - Gemini quota/invalid: set new key (secrets set); if model NOT_FOUND, change model or set GEMINI_MODEL secret.
  - SerpApi quota: site still works; related searches may be empty until reset.
  - Frontend env wrong: update Pages env, redeploy.

Where to run commands
- Use cmd.exe in your project folder: C:\Users\priya\Downloads\saas-idea-insights-main\saas-idea-insights-main
- Backend (Supabase) commands run from here; frontend auto-deploys from Git pushes.

Deploy/maintenance commands (copy/paste)
- Redeploy backend (only when function code changes):
  - npx supabase link --project-ref ahrcjezwjedgesjaclkb
  - npx supabase functions deploy validate-idea --no-verify-jwt --project-ref ahrcjezwjedgesjaclkb
- Rotate backend keys (no redeploy):
  - npx supabase secrets set GEMINI_API_KEY=NEW_KEY SERPAPI_API_KEY=NEW_KEY
- Local run (to test):
  - taskkill /F /IM node.exe
  - npm install
  - npm run dev (open the URL Vite prints, usually http://localhost:5173)

Bottom line
- Host code from GitHub via Cloudflare Pages.
- Keep API on Supabase.
- Push to main to update the site.
- Rotate keys via Supabase secrets (no redeploy).
- Optional improvement: enable GEMINI_MODEL secret to switch models without code change.

Update MANUAL.md locally and push to GitHub
- cmd.exe in project root:
  - git add MANUAL.md
  - git commit -m "docs: add recommended free deployment strategy and ops guide"
  - git push -u origin main
