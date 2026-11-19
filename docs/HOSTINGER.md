# Hostinger deployment

Do not buy a plan, point DNS, or deploy while following this document. It is the procedure to run once the plan is confirmed.

No plan is selected in the repository. Read the decision table in the [README](../README.md) first. This application needs a plan that runs Node.js.

## What to deploy

One Node.js website, from the repository root. Express listens on `PORT`, serves `frontend/build`, and handles `/api/enquiries`. React Router paths such as `/About` and `/3DAnimation` receive `index.html`.

Do not set the root directory to `frontend/` or `backend/`. Hostinger builds only that subdirectory, and the other half of the app would be missing.

Do not set the output directory to `frontend/build`. For Express, Hostinger deploys the whole application directory and leaves the output directory empty. Pointing it at `build` publishes the static files and does not run the API.

## hPanel settings

Websites → Add website → Node.js web app.

| Setting | Value |
| --- | --- |
| Framework preset | Express |
| Node.js version | 20 or 22 |
| Root directory | `/` (repository root) |
| Package manager | npm (from `package-lock.json`) |
| Build command | `npm run build` |
| Output directory | Empty |
| Entry file | `backend/server.js` |

`www` and the bare domain should be hostnames on this one website, not a second Node.js app.

Enable the free SSL certificate and force HTTPS in hPanel. The app trusts one proxy hop and refuses plain HTTP in production, except `GET /api/health` and `GET /health`.

## Environment variables

Add these on the Node.js app before the first build. Saving redeploys, and the values are available to `npm run build` and to the running process. They stay out of GitHub.

| Name | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `EMAIL_USER` | The Gmail address that sends mail |
| `EMAIL_PASS` | A new Google App Password |
| `RECIPIENT_EMAIL` | The inbox that should receive enquiries |
| `ALLOWED_ORIGINS` | `https://your-domain.example,https://www.your-domain.example` |
| `REACT_APP_API_URL` | Empty |
| `REACT_APP_SITE_URL` | `https://your-domain.example` |

Leave `PORT` unset. Hostinger provides it. Leave `TRUST_PROXY` and `REQUIRE_HTTPS` unset unless a health check shows HTTPS detection is wrong; the production defaults are `1` and `true`.

Create the App Password in the Google account after 2-Step Verification. If an older App Password was ever committed, revoke it in Google and create a new one. Type the new value only into hPanel.

`REACT_APP_SITE_URL` must be set before the build that goes live. Without it the site still loads, and `sitemap.xml` is not written.

## Build and start

On each deploy Hostinger runs:

1. `npm install` at the repository root (Express and the mailer).
2. `npm run build`, which installs the frontend from `frontend/package-lock.json` and writes `frontend/build`.
3. `node backend/server.js`.

The process logs one JSON line per event to stdout and stderr. A normal start looks like `server.started` with `website: true`, then `mail.verify` with `"status":"ready"`. A missing build logs `server.website_missing` and the API still starts. A missing mail variable or an empty `ALLOWED_ORIGINS` stops the process before it listens. Crashes are restarted by Hostinger. `uncaughtException` closes the server and logs `process.uncaught_exception` with the error name and message only.

## Routes to open after deploy

Open each URL directly in a new tab, not only by clicking through the homepage.

- `https://your-domain.example/`
- `https://your-domain.example/About`
- `https://your-domain.example/CoursePage`
- `https://your-domain.example/3DAnimation`
- `https://your-domain.example/VFX`
- `https://your-domain.example/Gaming`
- `https://your-domain.example/WebGraphicPage`
- `https://your-domain.example/ShortTermSpecializedPage`
- `https://your-domain.example/MoreCareerCoursesPage`
- `https://your-domain.example/StudentShowcase`
- `https://your-domain.example/Placement`
- `https://your-domain.example/Contact`
- `https://your-domain.example/not-a-real-page` (the site’s own “Page not found” screen)
- `https://your-domain.example/api/health`

`/api/health` must be JSON with `status`, `mail`, and `uptimeSeconds` only. `mail` must be `ready`. Toggle the theme, reload, and confirm it stays. Submit one real enquiry and confirm it arrives at `RECIPIENT_EMAIL`. A second immediate submit should be accepted and not send a second email.

Hashed files under `/static/` are cached for a year. `index.html` is not. After a deploy, a normal reload is enough to pick up a new bundle.

## Static-only upload

Use this only to understand why it is the wrong plan. Copying `frontend/build` into `public_html` serves the pages, and `frontend/public/.htaccess` sends unknown paths back to `index.html`. The enquiry form then calls `/api/enquiries` on that host, and Apache has no such API. Premium, Single, WordPress, and Agency plans cannot start `backend/server.js`.

## Rollback

1. hPanel → the Node.js website → Deployments → redeploy the previous successful deployment.
2. Otherwise push the previous git commit to the connected branch and let Hostinger rebuild.
3. Or restore that day’s backup from hPanel → Backups.

Do not edit DNS as part of a rollback. Environment variables are not reverted by a code redeploy. After any rollback, check `/` and `/api/health` again.

## Deployment checklist

- [ ] Plan is Business/Unlimited or a Cloud plan (or a VPS you will administer). A static-only plan is rejected.
- [ ] Gmail App Password is newly created. Any password that reached git history is revoked.
- [ ] `.env` files are absent from the repository that Hostinger will read (`git status` shows none).
- [ ] hPanel environment variables are set as in the table above, and `REACT_APP_API_URL` is empty.
- [ ] SSL is on, and HTTPS is forced in hPanel.
- [ ] Root directory is `/`, framework Express, output directory empty, entry file `backend/server.js`, Node 20 or 22.
- [ ] Build command is `npm run build`.
- [ ] `server.started` logs `website: true`.
- [ ] `mail.verify` logs `ready`.
- [ ] Every route in the list above loads when opened directly.
- [ ] Theme toggle persists after reload, in both dark and light.
- [ ] Favicon is the MAAC mark, not the React logo.
- [ ] One enquiry arrives in the recipient inbox. A duplicate submit does not send a second email.
- [ ] `/api/health` exposes no secrets.
- [ ] DNS is still unchanged until you deliberately attach the domain.
