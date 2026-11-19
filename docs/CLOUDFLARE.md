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
| `RESEND_API_KEY` | Secret (encrypted) | The Resend API key |
| `ENQUIRY_TO_EMAIL` | Plain text | The existing Gmail inbox that should receive enquiries |
| `ENQUIRY_FROM_EMAIL` | Plain text | A sender on a domain verified in Resend, for example `MAAC Mathura <admissions@your-domain.example>` |
| `REACT_APP_SITE_URL` | Plain text | The public `https://` origin, no trailing slash. Used only to write the sitemap at build time. |

`REACT_APP_API_URL` is ignored. The form posts to `/api/enquiries` on the same origin.

Do not put the Resend key in the repository, in `frontend/.env`, or in a plain build variable. Pages encrypts variables marked as secrets and exposes them only as `env.RESEND_API_KEY` inside the Function.

## Resend domain

1. In Resend, add the domain you will send from.
2. Resend shows DNS records (SPF, DKIM, and sometimes a return-path). Add those records at the DNS host when you are ready to verify the domain. This repository does not change DNS.
3. Wait until Resend marks the domain verified.
4. Set `ENQUIRY_FROM_EMAIL` to an address on that domain. Resend rejects mail from an unverified domain.
5. The student’s address is the reply-to, so a reply from the Gmail inbox goes to the student.

## Routes

| Method and path | Behaviour |
| --- | --- |
| `POST /api/enquiries` | The path the React forms use. |
| `POST /api/enquiry` | The same handler. |
| `POST /send-email` | Legacy path. It does not require the form timing field. |
| `GET /api/health` | `{ status, mail }` where `mail` is `configured` or `not_configured`. No addresses and no API key. |

React Router URLs load directly because the build has no `404.html`. Pages then serves `index.html` for any path that is not a file or a Function. Do not add `/* /index.html 200` to `_redirects`. Current Pages rejects that rule as a redirect loop. Do not add a `404.html` either, because that turns the fallback off.

## Local check

```bash
cd frontend
npm ci
npm run test:functions
npm run build
npx wrangler pages dev build --compatibility-date=2026-11-19 --port 8788
```

Put the three mail variables in `frontend/.dev.vars` for that command. That file is gitignored. Without a real Resend key, a valid enquiry returns an email failure. That is not a successful delivery.
