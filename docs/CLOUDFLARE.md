# Cloudflare Pages

Do not deploy this project or change DNS while following this document. The Express API in `backend/` stays until the Pages Function has been approved.

The Pages project root is `frontend`. The React app is unchanged. Pages Functions live in `frontend/functions` and are not copied into `frontend/build`.

## Dashboard

Create a Pages project connected to `maacmathura-design/website`. Use these settings:

| Setting | Value |
| --- | --- |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Build output directory | `build` |
| Functions | `frontend/functions`, picked up automatically when the root directory is `frontend` |
| Production branch | `main` |
| Node.js | 20 or 22 |

Do not set the output directory to `functions`, and do not move `functions` inside `build`.

Add environment variables for both Production and Preview:

| Name | Type | Value |
| --- | --- | --- |
| `RESEND_API_KEY` | Secret (encrypted) | The Gmail app password for `ENQUIRY_FROM_EMAIL`. The name is the existing secret. |
| `ENQUIRY_TO_EMAIL` | Plain text | The Gmail inbox that should receive enquiries |
| `ENQUIRY_FROM_EMAIL` | Plain text | The Gmail address that signs in to SMTP and appears as the sender |
| `REACT_APP_SITE_URL` | Plain text | The public `https://` origin, no trailing slash. Used only to write the sitemap at build time. |

`REACT_APP_API_URL` is ignored. The form posts to `/api/enquiries` on the same origin.

Do not put the app password in the repository, in `frontend/.env`, or in a plain build variable. Pages encrypts `RESEND_API_KEY` and exposes it only as `env.RESEND_API_KEY` inside the Function. The Function uses that value as the Gmail SMTP password. A Resend API key in that secret cannot sign in to Gmail.

The Function connects to `smtp.gmail.com` on port 465. `ENQUIRY_FROM_EMAIL` is both the sender and the SMTP username. The student’s address is the reply-to. No new environment variables are required.

## Routes

| Method and path | Behaviour |
| --- | --- |
| `POST /api/enquiries` | The path the React forms use. |
| `POST /api/enquiry` | The same handler. |
| `POST /send-email` | Legacy path. It does not require the form timing field. |
| `GET /api/health` | `{ status, mail, delivery }`. `mail` is `configured` or `not_configured`. `delivery` is `not_checked`. No addresses and no password. |

React Router URLs load directly because the build has no `404.html`. Pages then serves `index.html` for any path that is not a file or a Function. Do not add `/* /index.html 200` to `_redirects`. Current Pages rejects that rule as a redirect loop. Do not add a `404.html` either, because that turns the fallback off.

## Local check

```bash
cd frontend
npm ci
npm run test:functions
npm run build
npx wrangler pages dev build --compatibility-date=2026-11-19 --port 8788
```

Put the three mail variables in `frontend/.dev.vars` for that command. That file is gitignored. `RESEND_API_KEY` must be the Gmail app password. A health response of `mail: configured` does not mean an email was sent.
