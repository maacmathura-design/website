const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateEnquiry, detectSpam, normaliseMobile } = require('../src/validation/enquiry');
const { buildEnquiryEmail, escapeHtml } = require('../src/services/enquiryEmail');
const { classifyMailError } = require('../src/services/mailer');
const { loadConfig } = require('../src/config');

test('normaliseMobile accepts Indian mobile formats only', () => {
  assert.equal(normaliseMobile('9876543210'), '9876543210');
  assert.equal(normaliseMobile('+91 98765-43210'), '9876543210');
  assert.equal(normaliseMobile('091 9876543210'), null);
  assert.equal(normaliseMobile('09876543210'), '9876543210');
  assert.equal(normaliseMobile(9876543210), '9876543210');
  assert.equal(normaliseMobile('5876543210'), null);
  assert.equal(normaliseMobile({}), null);
});

test('validateEnquiry cleans values and drops unknown fields', () => {
  const { enquiry } = validateEnquiry({
    name: '  Asha\u0000   Sharma ',
    mobile: '+919876543210',
    email: ' ASHA@EXAMPLE.COM ',
    course: 'animation',
    message: 'Line one\r\nLine two',
    isAdmin: true,
  });
  assert.deepEqual(enquiry, {
    name: 'Asha Sharma',
    mobile: '9876543210',
    email: 'asha@example.com',
    course: 'animation',
    qualification: null,
    callbackTime: null,
    message: 'Line one\nLine two',
    sourcePage: null,
    formLocation: null,
  });
});

test('validateEnquiry handles non-object bodies', () => {
  for (const body of [null, 'text', 42, []]) {
    assert.deepEqual(Object.keys(validateEnquiry(body).errors).sort(), ['course', 'email', 'mobile', 'name']);
  }
});

test('validateEnquiry accepts names in Indian scripts and with apostrophes', () => {
  for (const name of ['आशा शर्मा', "D'Souza", 'K. Ramesh', 'Anne-Marie']) {
    assert.equal(validateEnquiry({ name, mobile: '9876543210', email: 'a@b.co', course: 'vfx' }).errors, undefined, name);
  }
});

test('detectSpam', () => {
  const options = { minFillMs: 2000, requireTiming: true };
  assert.equal(detectSpam({ website: 'x', elapsedMs: 9000 }, options), 'honeypot');
  assert.equal(detectSpam({ elapsedMs: 100 }, options), 'too_fast');
  assert.equal(detectSpam({ elapsedMs: '9000' }, options), 'too_fast');
  assert.equal(detectSpam({}, options), 'missing_timing');
  assert.equal(detectSpam({}, { ...options, requireTiming: false }), null);
  assert.equal(detectSpam({ elapsedMs: 9000, message: 'see https://a.example and https://b.example' }, options), null);
  assert.equal(detectSpam({ elapsedMs: 9000, message: 'https://a https://b https://c' }, options), 'links');
});

test('escapeHtml covers the five HTML-significant characters', () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});

test('buildEnquiryEmail formats IST time and keeps the subject on one line', () => {
  const { subject, text } = buildEnquiryEmail(
    { name: 'Asha', mobile: '9876543210', email: 'a@b.co', course: 'max-pro-cinema-4d', qualification: null, callbackTime: 'anytime', message: null, sourcePage: '/ShortTermSpecializedPage#max-pro-cinema-4d', formLocation: 'page' },
    { submittedAt: new Date('2026-11-19T10:00:00Z') },
  );
  assert.equal(subject, 'New admission enquiry: MAX PRO (Cinema 4D) – Asha');
  assert.match(text, /Submitted at: 19 Nov 2026, 3:30\s?pm IST/i);
  assert.match(text, /Preferred callback time: Any time/);
  assert.match(text, /Submitted from: Enquiry form on the page/);
});

test('classifyMailError distinguishes Gmail auth failures', () => {
  assert.equal(classifyMailError({ code: 'EAUTH', responseCode: 535 }).kind, 'auth_failed');
  assert.equal(classifyMailError({ code: 'ECONNECTION' }).kind, 'delivery_failed');
  assert.equal(classifyMailError({ responseCode: 550 }).code, 'SMTP 550');
});

test('loadConfig defaults are safe for production', () => {
  const production = loadConfig({ NODE_ENV: 'production' });
  assert.equal(production.requireHttps, true);
  assert.deepEqual(production.allowedOrigins, []);
  assert.equal(production.trustProxy, 1);
  assert.deepEqual(production.missingMailVariables, ['EMAIL_USER', 'EMAIL_PASS', 'RECIPIENT_EMAIL']);

  const development = loadConfig({});
  assert.equal(development.requireHttps, false);
  assert.equal(development.port, 5050);
  assert.ok(development.allowedOrigins.includes('http://localhost:3000'));

  assert.deepEqual(loadConfig({ ALLOWED_ORIGINS: 'https://a.example/, https://b.example' }).allowedOrigins, ['https://a.example', 'https://b.example']);
});
