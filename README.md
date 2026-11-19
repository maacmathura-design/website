# MAAC Mathura

The public website (React) and the admission enquiry API (Express, Gmail SMTP). One Node.js process serves both, so browser calls stay on the same origin.

No Hostinger plan is selected in this repository. The hosting decision below is based on Hostinger’s published Node.js documentation, checked for this release. Do not upload the site, buy a plan, or change DNS until that choice is confirmed.

## Hosting decision

The enquiry form cannot run on static hosting. Gmail SMTP needs the Express process.

| Hostinger plan | React site | Express API | Use this app as |
| --- | --- | --- | --- |
| Single, Premium, WordPress hosting | Yes, as files in `public_html` | No | Not enough. The form would have nowhere to send mail. |
| Agency | Static frontend only | No persistent Node process | Not enough. |
| Business / Unlimited web hosting | Yes | Yes. One Node.js website, Node 18, 20, 22, or 24 | **Sufficient.** Deploy this repository as one Express app. |
| Cloud Startup, Professional, Enterprise, Enterprise Plus | Yes | Yes, with higher process limits | **Sufficient**, same deployment as Business. |
| VPS or dedicated | Yes | Yes, if you install Node yourself | Possible, but you manage the server. This guide does not use that path. |

Business and Cloud Node.js hosting, per Hostinger:

- One long-running Node process per website. The platform sets `PORT`. The app must listen on that port.
- Requests stop after 120 seconds. An enquiry email is well inside that.
- No inbound WebSockets, extra ports, Docker, or Redis. This app does not need them.
- `www` and the apex domain each count as a process if both are attached as separate websites. Attach one website and point both hostnames at it.

**Frontend and backend do not need separate hosting** on Business/Unlimited or any Cloud plan. A static-only plan cannot run the API, so that plan would require a second host for Express. Do not split them if the selected plan is Business or Cloud.

Sources: [Node.js hosting methods](https://www.hostinger.com/support/node-js-hosting-options-at-hostinger/), [plan limits](https://www.hostinger.com/support/hostinger-node-js-limits-for-web-and-cloud-plans/), [adding a Node.js app](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/), [Express on Hostinger](https://docs.hostinger.com/node.js/overview-1/express), [environment variables](https://docs.hostinger.com/node.js/environment-variables), [build settings](https://docs.hostinger.com/node.js/build-settings).

The step-by-step for hPanel is in [docs/HOSTINGER.md](docs/HOSTINGER.md).

## Local setup

Requirements: Node.js 20 or newer, and a Gmail account with 2-Step Verification and an App Password.

```bash
cd maac_mathura
npm ci --prefix backend
npm ci --prefix frontend
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.development.local
```

Fill `backend/.env` locally. Leave `REACT_APP_API_URL` empty in the frontend file so the dev server proxies `/api` to `http://localhost:5050`.

```bash
npm run dev:api
npm run dev:web
```

The site is at <http://localhost:3000>. The API is at <http://localhost:5050/api/health>.

`backend/.env` and every `.env.*` file except `*.env.example` are gitignored. Do not commit them.

## Environment variables

Set production values in hPanel → the Node.js app → Environment variables. Hostinger injects them for the build and the running process. Importing a `.env` file there stores the values on the host; it does not put them in GitHub.

Variable names only. Never paste secret values into the repository, a ticket, or a chat.

### API (runtime)

| Name | Required in production | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Set by Hostinger | Port the process must listen on. Do not hardcode it. |
| `EMAIL_USER` | Yes | Gmail address that sends mail. |
| `EMAIL_PASS` | Yes | Google App Password, not the mailbox password. Rotate any password that has appeared in git history before putting it here. |
| `RECIPIENT_EMAIL` | Yes | Inbox that receives enquiries. |
| `ALLOWED_ORIGINS` | Yes | Comma-separated `https://` origins, no paths. Include both the apex and `www` hostnames. |
| `TRUST_PROXY` | Defaults to `1` | Hostinger’s proxy hop. Needed so HTTPS detection and rate limits see the visitor. |
| `REQUIRE_HTTPS` | Defaults to true | Rejects requests that did not arrive as HTTPS. Health checks on `/api/health` stay available over HTTP. |
| `SERVE_STATIC` | Optional | `false` skips the React build. Leave unset so `frontend/build` is served. |
| `ENQUIRY_RATE_LIMIT_MAX` | Optional | Default 5 requests per window. |
| `ENQUIRY_RATE_LIMIT_WINDOW_MINUTES` | Optional | Default 15. |
| `ENQUIRY_DUPLICATE_WINDOW_MINUTES` | Optional | Default 10. |
| `ENQUIRY_MIN_FILL_SECONDS` | Optional | Default 2. |

The process refuses to start in production when a mail variable or `ALLOWED_ORIGINS` is missing. Startup logs the event name and the variable names. They do not log secret values, student details, or message bodies.

### Website (build time)

| Name | Required | Purpose |
| --- | --- | --- |
| `REACT_APP_API_URL` | Leave empty | Empty means the page calls `/api` on its own origin. Set an `https://` URL only if the API is on another host. `npm run build` rejects `http://` and localhost. |
| `REACT_APP_SITE_URL` | Yes, for the real deploy | Public `https://` origin, no trailing slash. Writes `sitemap.xml` and the Sitemap line in `robots.txt`. These values are compiled into the public JavaScript. They are not secrets. |

## Production build

From the repository root, which is also what Hostinger runs:

```bash
REACT_APP_SITE_URL=https://your-domain.example npm run build
npm start
```

`npm run build` installs the frontend from its lockfile and writes `frontend/build`. `npm start` runs `node backend/server.js`.

Confirm before uploading or connecting the repository:

- `frontend/build/index.html` exists, with the favicon links and the theme boot script.
- `frontend/build/.htaccess` exists (copied from `frontend/public/`). Express does not need it. Apache does, if the files are ever uploaded on their own.
- `GET /`, `GET /About`, `GET /Contact`, and `GET /CoursePage` return the HTML app.
- `GET /api/health` returns JSON `status` and `mail`, and nothing else about configuration.
- The theme toggle still stores `maac-theme` and survives a reload.

## Rollback

Do this in hPanel. Do not change DNS.

1. Open the Node.js website → Deployments and redeploy the last successful deployment.
2. If that list is not available, check out the previous git commit locally and push it to the branch Hostinger builds. Hostinger installs, builds, and restarts on that push.
3. For a file-level restore, use hPanel → Backups (daily backups on Business and Cloud). Restoring a backup does not restore environment variables; those stay on the app until you edit them.
4. After the rollback, open `/` and `/api/health` again. `mail` should still be `ready`.
