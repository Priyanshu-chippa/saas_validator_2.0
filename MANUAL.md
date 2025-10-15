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
