import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEnquiryRuntime } from './_lib/enquiryCore.mjs';
import functionOptions from './_lib/enquiryOptions.mjs';

const KEY = 're_test_key_do_not_log';
const ENV = {
  RESEND_API_KEY: KEY,
  ENQUIRY_TO_EMAIL: 'admissions@example.com',
  ENQUIRY_FROM_EMAIL: 'MAAC Mathura <enquiry@example.com>',
};

const validBody = (overrides = {}) => ({
  name: 'Asha Sharma',
  mobile: '9876543210',
  email: 'asha@example.com',
  course: 'vfx',
  qualification: '12th',
  callbackTime: 'evening',
  message: 'I would like to know about batch timings.',
  sourcePage: '/VFX',
  formLocation: 'popup',
  website: '',
  elapsedMs: 8000,
  ...overrides,
});

const request = (body, { headers = {}, raw } = {}) => new Request('https://maac.example/api/enquiries', {
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: raw === undefined ? JSON.stringify(body) : raw,
});

const okFetch = (sent) => async (url, init) => {
  sent.push({ url, init });
  return new Response(JSON.stringify({ id: 'email_123' }), { status: 200, headers: { 'content-type': 'application/json' } });
};

test('the function allowlist matches the Express allowlist', () => {
  const backend = JSON.parse(readFileSync(new URL('../../backend/src/enquiryOptions.json', import.meta.url), 'utf8'));
  assert.deepEqual(functionOptions, backend);
});

test('a valid enquiry is sent through Resend without leaking the API key', async () => {
  const sent = [];
  const runtime = createEnquiryRuntime({ fetchImpl: okFetch(sent) });
  const response = await runtime.handle(request(validBody()), ENV);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, 'https://api.resend.com/emails');
  assert.equal(sent[0].init.headers.Authorization, `Bearer ${KEY}`);
  const payload = JSON.parse(sent[0].init.body);
  assert.deepEqual(payload.to, [ENV.ENQUIRY_TO_EMAIL]);
  assert.equal(payload.from, ENV.ENQUIRY_FROM_EMAIL);
  assert.equal(payload.reply_to, 'asha@example.com');
  assert.match(payload.subject, /VFX – ADVFX PLUS – Asha Sharma/);
  assert.match(payload.text, /Mobile number: \+91 98765 43210/);
  assert.match(payload.html, /Enquire Now pop-up/);
  assert.equal(JSON.stringify(body).includes(KEY), false);
  assert.equal(payload.html.includes('<script>'), false);
});

test('HTML email escapes student content', async () => {
  const sent = [];
  const runtime = createEnquiryRuntime({ fetchImpl: okFetch(sent) });
  await runtime.handle(request(validBody({ message: '<script>alert("x")</script> & <b>bold</b>' })), ENV);
  const payload = JSON.parse(sent[0].init.body);
  assert.equal(payload.html.includes('<script>'), false);
  assert.match(payload.html, /&lt;script&gt;/);
  assert.match(payload.text, /<script>alert\("x"\)<\/script>/);
});

test('missing and invalid fields are rejected', async () => {
  const runtime = createEnquiryRuntime({ fetchImpl: async () => { throw new Error('should not send'); } });
  const missing = await runtime.handle(request({ elapsedMs: 8000, website: '' }), ENV);
  const missingBody = await missing.json();
  assert.equal(missing.status, 422);
  assert.deepEqual(Object.keys(missingBody.fields).sort(), ['course', 'email', 'mobile', 'name']);

  const invalid = await runtime.handle(request(validBody({ mobile: '12345', email: 'not-an-email' })), ENV);
  const invalidBody = await invalid.json();
  assert.equal(invalid.status, 422);
  assert.equal(invalidBody.fields.mobile.includes('10-digit'), true);
  assert.equal(invalidBody.fields.email.includes('valid email'), true);
});

test('malformed, non-JSON and oversized bodies are rejected', async () => {
  const runtime = createEnquiryRuntime();
  const broken = await runtime.handle(request(null, { raw: '{"name":' }), ENV);
  assert.equal(broken.status, 400);
  assert.equal((await broken.json()).error, 'invalid_json');

  const text = await runtime.handle(request(null, { raw: 'name=Asha', headers: { 'content-type': 'text/plain' } }), ENV);
  assert.equal(text.status, 415);

  const huge = await runtime.handle(request(null, { raw: 'x'.repeat(11000) }), ENV);
  assert.equal(huge.status, 413);
});

test('honeypot, missing timing and link spam are dropped without sending', async () => {
  let calls = 0;
  const runtime = createEnquiryRuntime({ fetchImpl: async () => { calls += 1; return new Response('{}', { status: 200 }); } });
  for (const body of [
    validBody({ website: 'https://spam.example' }),
    validBody({ elapsedMs: undefined }),
    validBody({ message: 'see https://a.example and https://b.example and www.c.example' }),
  ]) {
    const response = await runtime.handle(request(body), ENV);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
  }
  assert.equal(calls, 0);
});

test('a too-fast submission asks the student to resend', async () => {
  const runtime = createEnquiryRuntime();
  const response = await runtime.handle(request(validBody({ elapsedMs: 100 })), ENV);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'too_fast');
});

test('a duplicate enquiry is acknowledged once and a failed send can be retried', async () => {
  const sent = [];
  let fail = true;
  const runtime = createEnquiryRuntime({
    fetchImpl: async (url, init) => {
      if (fail) {
        fail = false;
        return new Response('{}', { status: 500 });
      }
      sent.push(init);
      return new Response(JSON.stringify({ id: 'email_123' }), { status: 200 });
    },
  });
  const first = await runtime.handle(request(validBody()), ENV);
  assert.equal(first.status, 502);
  const second = await runtime.handle(request(validBody()), ENV);
  assert.equal(second.status, 200);
  const third = await runtime.handle(request(validBody()), ENV);
  assert.equal((await third.json()).duplicate, true);
  assert.equal(sent.length, 1);
});

test('an authentication failure from Resend does not reveal the key', async () => {
  const runtime = createEnquiryRuntime({
    fetchImpl: async () => new Response(JSON.stringify({ message: KEY }), { status: 401 }),
  });
  const response = await runtime.handle(request(validBody()), ENV);
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.error, 'email_unavailable');
  assert.equal(JSON.stringify(body).includes(KEY), false);
});

test('missing mail configuration returns 503', async () => {
  let calls = 0;
  const runtime = createEnquiryRuntime({ fetchImpl: async () => { calls += 1; return new Response('{}'); } });
  const response = await runtime.handle(request(validBody()), {});
  assert.equal(response.status, 503);
  assert.equal(calls, 0);
});

test('repeated posts from one address are rate limited', async () => {
  const runtime = createEnquiryRuntime({
    fetchImpl: async () => new Response(JSON.stringify({ id: 'email_123' }), { status: 200 }),
  });
  for (let index = 0; index < 5; index += 1) {
    const response = await runtime.handle(request(validBody({ email: `student${index}@example.com` })), ENV);
    assert.equal(response.status, 200);
  }
  const blocked = await runtime.handle(request(validBody({ email: 'student6@example.com' })), ENV);
  const body = await blocked.json();
  assert.equal(blocked.status, 429);
  assert.equal(body.error, 'rate_limited');
  assert.ok(body.retryAfterSeconds >= 1);
});

test('health reports configuration without values', async () => {
  const runtime = createEnquiryRuntime();
  const ready = await runtime.health(ENV);
  const readyBody = await ready.json();
  assert.deepEqual(readyBody, { status: 'ok', mail: 'configured' });
  assert.equal(JSON.stringify(readyBody).includes(KEY), false);
  assert.equal(JSON.stringify(readyBody).includes('admissions@example.com'), false);

  const missing = await (await runtime.health({})).json();
  assert.deepEqual(missing, { status: 'degraded', mail: 'not_configured' });
});
