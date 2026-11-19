/**
 * Runs before `npm run build`. Loads the same .env files a production build uses and refuses to
 * build when the enquiry API URL is not HTTPS or points at a local machine.
 */
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
require('react-scripts/config/env');

const url = (process.env.REACT_APP_API_URL || '').trim();

if (!url) {
  console.log('REACT_APP_API_URL is empty: the site will call /api/enquiries on its own origin.');
  process.exit(0);
}

let parsed;
try {
  parsed = new URL(url);
} catch {
  console.error(`REACT_APP_API_URL is not a valid URL: "${url}"`);
  process.exit(1);
}

if (parsed.protocol !== 'https:') {
  console.error('REACT_APP_API_URL must use https:// in production builds.');
  process.exit(1);
}
if (/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(parsed.hostname)) {
  console.error('REACT_APP_API_URL points at a local machine; set the public API URL for production builds.');
  process.exit(1);
}

console.log(`Enquiry API for this build: ${parsed.origin}`);
