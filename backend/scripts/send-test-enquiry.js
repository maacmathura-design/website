/**
 * Sends one clearly labelled test enquiry through a running API, which emails it via Gmail.
 *
 *   npm run smoke:email                                  # http://localhost:$PORT (default 5050)
 *   npm run smoke:email -- https://api.example.com       # deployed API
 *
 * Exit code 0 means the API accepted the enquiry and Gmail accepted the message for delivery.
 * Confirm receipt in the RECIPIENT_EMAIL inbox.
 */
const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const baseUrl = (process.argv[2] || `http://localhost:${process.env.PORT || 5050}`).replace(/\/+$/, '');
const stamp = new Date().toISOString();

async function main() {
  const health = await fetch(`${baseUrl}/api/health`).then((response) => response.json());
  console.log('Health:', health);

  const response = await fetch(`${baseUrl}/api/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Website Test',
      mobile: '9999999999',
      email: `enquiry-test+${Date.now()}@example.com`,
      course: 'animation',
      qualification: '12th',
      callbackTime: 'anytime',
      message: `Automated end-to-end test of the enquiry form (${stamp}). Please ignore.`,
      sourcePage: '/smoke-test',
      formLocation: 'page',
      website: '',
      elapsedMs: 5000,
    }),
  });
  const body = await response.json();
  console.log(`POST /api/enquiries -> ${response.status}`, body);
  if (!response.ok || body.duplicate) process.exitCode = 1;
}

main().catch((error) => {
  console.error('Smoke test failed:', error.message);
  process.exitCode = 1;
});
