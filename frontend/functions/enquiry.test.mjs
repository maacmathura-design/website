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

const recordSend = (sent) => async (message) => {
  sent.push(message);
  return { messageId: 'email_123' };
};

test('the function allowlist matches the Express allowlist', () => {
  const backend = JSON.parse(readFileSync(new URL('../../backend/src/enquiryOptions.json', import.meta.url), 'utf8'));
  assert.deepEqual(functionOptions, backend);
});

test('a valid enquiry is sent through Gmail without leaking the app password', async () => {
  const sent = [];
  const runtime = createEnquiryRuntime({ sendImpl: recordSend(sent) });
  const response = await runtime.handle(request(validBody()), ENV);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, ENV.ENQUIRY_TO_EMAIL);
  assert.equal(sent[0].from, ENV.ENQUIRY_FROM_EMAIL);
  assert.equal(sent[0].replyTo, 'asha@example.com');
  assert.match(sent[0].subject, /VFX – ADVFX PLUS – Asha Sharma/);
  assert.match(sent[0].text, /Mobile number: \+91 98765 43210/);
  assert.match(sent[0].html, /Enquire Now pop-up/);
  assert.equal(JSON.stringify(body).includes(KEY), false);
  assert.equal(sent[0].html.includes('<script>'), false);
  assert.equal(JSON.stringify(sent[0]).includes(KEY), false);
});

test('HTML email escapes student content', async () => {
  const sent = [];
  const runtime = createEnquiryRuntime({ sendImpl: recordSend(sent) });
  await runtime.handle(request(validBody({ message: '<script>alert("x")</script> & <b>bold</b>' })), ENV);
  assert.equal(sent[0].html.includes('<script>'), false);
  assert.match(sent[0].html, /&lt;script&gt;/);
  assert.match(sent[0].text, /<script>alert\("x"\)<\/script>/);
});

test('missing and invalid fields are rejected', async () => {
  const runtime = createEnquiryRuntime({ sendImpl: async () => { throw new Error('should not send'); } });
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
  const runtime = createEnquiryRuntime({ sendImpl: async () => { calls += 1; return { messageId: 'email_123' }; } });
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
    sendImpl: async (message) => {
      if (fail) {
        fail = false;
        const error = new Error('mailbox unavailable');
        error.responseCode = 450;
        throw error;
      }
      sent.push(message);
      return { messageId: 'email_123' };
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

test('an authentication failure from Gmail does not reveal the app password', async () => {
  const runtime = createEnquiryRuntime({
    sendImpl: async () => {
      const error = new Error(`Invalid login: ${KEY}`);
      error.code = 'EAUTH';
      error.responseCode = 535;
      throw error;
    },
  });
  const response = await runtime.handle(request(validBody()), ENV);
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.error, 'email_unavailable');
  assert.equal(JSON.stringify(body).includes(KEY), false);
});

test('missing mail configuration returns 503', async () => {
  let calls = 0;
  const runtime = createEnquiryRuntime({ sendImpl: async () => { calls += 1; return { messageId: 'email_123' }; } });
  const response = await runtime.handle(request(validBody()), {});
  assert.equal(response.status, 503);
  assert.equal(calls, 0);
});

test('repeated posts from one address are rate limited', async () => {
  const runtime = createEnquiryRuntime({
    sendImpl: async () => ({ messageId: 'email_123' }),
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
  assert.deepEqual(readyBody, { status: 'ok', mail: 'configured', delivery: 'not_checked' });
  assert.equal(JSON.stringify(readyBody).includes(KEY), false);
  assert.equal(JSON.stringify(readyBody).includes('admissions@example.com'), false);

  const missing = await (await runtime.health({})).json();
  assert.deepEqual(missing, { status: 'degraded', mail: 'not_configured', delivery: 'not_checked' });
});
