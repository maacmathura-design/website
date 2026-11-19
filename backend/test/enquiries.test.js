const { test, describe, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { startApp, stubTransport, smtpTransport, validEnquiry, TEST_ENV } = require('./helpers/testApp');
const { startFakeSmtp } = require('./helpers/fakeSmtp');

let running = [];
const start = async (options) => {
  const instance = await startApp(options);
  running.push(instance);
  return instance;
};
afterEach(async () => {
  await Promise.all(running.map((instance) => instance.close()));
  running = [];
});

describe('POST /api/enquiries', () => {
  test('valid submission sends one email with every field and the source page', async () => {
    const api = await start();
    const response = await api.post('/api/enquiries', validEnquiry());
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(api.transport.sent.length, 1);

    const mail = api.transport.sent[0];
    assert.equal(mail.to, TEST_ENV.RECIPIENT_EMAIL);
    assert.deepEqual(mail.from, { name: 'MAAC Mathura Website', address: TEST_ENV.EMAIL_USER });
    assert.deepEqual(mail.replyTo, { name: 'Asha Sharma', address: 'asha@example.com' });
    assert.equal(mail.subject, 'New admission enquiry: VFX – ADVFX PLUS – Asha Sharma');
    for (const expected of [
      'Student name: Asha Sharma',
      'Mobile number: +91 98765 43210',
      'Email address: asha@example.com',
      'Course interested in: VFX – ADVFX PLUS',
      'Educational qualification: 12th (Higher Secondary)',
      'Preferred callback time: Evening',
      'Message: I would like to know about batch timings.',
      'Source page: /VFX',
      'Submitted from: Enquire Now pop-up',
      'Submitted at: ',
    ]) {
      assert.ok(mail.text.includes(expected), `text should include "${expected}"`);
    }
    assert.ok(mail.html.includes('href="tel:+919876543210"'));
  });

  test('optional fields may be omitted', async () => {
    const api = await start();
    const response = await api.post('/api/enquiries', {
      name: 'Ravi',
      mobile: '9876543210',
      email: 'ravi@example.com',
      course: 'short_term',
      elapsedMs: 4000,
    });
    assert.equal(response.status, 200);
    assert.match(api.transport.sent[0].text, /Educational qualification: Not provided/);
    assert.match(api.transport.sent[0].text, /Source page: Not provided/);
  });

  test('escapes user content in the HTML email', async () => {
    const api = await start();
    await api.post('/api/enquiries', validEnquiry({ message: '<script>alert("x")</script> & <b>bold</b>\nline two' }));
    const { html, text } = api.transport.sent[0];
    assert.ok(!html.includes('<script>'));
    assert.ok(!html.includes('<b>bold</b>'));
    assert.ok(html.includes('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &lt;b&gt;bold&lt;/b&gt;<br>line two'));
    assert.ok(text.includes('<script>alert("x")</script>'), 'plain text keeps the message as written');
  });

  test('rejects an invalid mobile number', async () => {
    const api = await start();
    for (const mobile of ['12345', '1234567890', '98765432101', 'abcdefghij']) {
      const response = await api.post('/api/enquiries', validEnquiry({ mobile }));
      const body = await response.json();
      assert.equal(response.status, 422, mobile);
      assert.equal(body.error, 'validation_failed');
      assert.deepEqual(Object.keys(body.fields), ['mobile']);
    }
    assert.equal(api.transport.sent.length, 0);
  });

  test('rejects an invalid email address', async () => {
    const api = await start();
    for (const email of ['asha', 'asha@', 'asha@example', 'a b@example.com', 'asha@example.c', '<x>@example.com']) {
      const response = await api.post('/api/enquiries', validEnquiry({ email }));
      const body = await response.json();
      assert.equal(response.status, 422, email);
      assert.deepEqual(Object.keys(body.fields), ['email']);
    }
    assert.equal(api.transport.sent.length, 0);
  });

  test('reports every missing required field', async () => {
    const api = await start();
    const response = await api.post('/api/enquiries', { elapsedMs: 5000 });
    const body = await response.json();
    assert.equal(response.status, 422);
    assert.deepEqual(Object.keys(body.fields).sort(), ['course', 'email', 'mobile', 'name']);
    assert.equal(api.transport.sent.length, 0);
  });

  test('rejects values outside the allowed lists', async () => {
    const api = await start();
    const response = await api.post(
      '/api/enquiries',
      validEnquiry({ course: 'hacking', qualification: 'phd', callbackTime: 'midnight', formLocation: 'iframe', sourcePage: 'https://evil.example' }),
    );
    const body = await response.json();
    assert.equal(response.status, 422);
    assert.deepEqual(Object.keys(body.fields).sort(), ['callbackTime', 'course', 'formLocation', 'qualification', 'sourcePage']);
  });

  test('rejects names with markup and overlong messages', async () => {
    const api = await start();
    let response = await api.post('/api/enquiries', validEnquiry({ name: '<img src=x onerror=alert(1)>' }));
    assert.equal(response.status, 422);
    response = await api.post('/api/enquiries', validEnquiry({ message: 'a'.repeat(1001) }));
    assert.equal(response.status, 422);
    assert.equal(api.transport.sent.length, 0);
  });

  test('silently drops a submission that fills the honeypot', async () => {
    const api = await start();
    const response = await api.post('/api/enquiries', validEnquiry({ website: 'https://spam.example' }));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(api.transport.sent.length, 0);
  });

  test('silently drops link spam and submissions without form timing', async () => {
    const api = await start();
    const links = 'Visit http://a.example http://b.example http://c.example';
    for (const body of [validEnquiry({ message: links }), validEnquiry({ name: 'www.spam.com' }), validEnquiry({ elapsedMs: undefined })]) {
      const response = await api.post('/api/enquiries', body);
      assert.equal(response.status, 200);
    }
    assert.equal(api.transport.sent.length, 0);
  });

  test('asks the sender to resubmit when the form was completed implausibly fast', async () => {
    const api = await start();
    const response = await api.post('/api/enquiries', validEnquiry({ elapsedMs: 300 }));
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.error, 'too_fast');
    assert.equal(api.transport.sent.length, 0);
  });

  test('a repeated submission is acknowledged but emailed only once', async () => {
    const api = await start();
    const first = await api.post('/api/enquiries', validEnquiry());
    const second = await api.post('/api/enquiries', validEnquiry({ mobile: '9876543210', email: 'asha@example.com' }));
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal((await second.json()).duplicate, true);
    assert.equal(api.transport.sent.length, 1);

    const otherCourse = await api.post('/api/enquiries', validEnquiry({ course: 'gaming' }));
    assert.equal(otherCourse.status, 200);
    assert.equal(api.transport.sent.length, 2);
  });

  test('simultaneous double submissions send one email', async () => {
    const api = await start();
    const responses = await Promise.all([api.post('/api/enquiries', validEnquiry()), api.post('/api/enquiries', validEnquiry())]);
    assert.deepEqual(responses.map((response) => response.status), [200, 200]);
    assert.equal(api.transport.sent.length, 1);
  });

  test('rate limits repeated requests from one address', async () => {
    const api = await start({ env: { ENQUIRY_RATE_LIMIT_MAX: '3' } });
    const statuses = [];
    for (let index = 0; index < 4; index += 1) {
      const response = await api.post('/api/enquiries', validEnquiry({ course: ['vfx', 'gaming', 'animation', 'web_design'][index] }));
      statuses.push(response.status);
      if (response.status === 429) {
        const body = await response.json();
        assert.equal(body.error, 'rate_limited');
        assert.ok(body.retryAfterSeconds > 0);
        assert.ok(response.headers.get('ratelimit'));
      }
    }
    assert.deepEqual(statuses, [200, 200, 200, 429]);
    assert.equal(api.transport.sent.length, 3);
  });

  test('legacy /send-email still works for cached pages', async () => {
    const api = await start();
    const response = await api.post('/send-email', { name: 'Asha', mobile: '9876543210', email: 'asha@example.com', course: 'gaming' });
    assert.equal(response.status, 200);
    assert.equal(api.transport.sent.length, 1);
  });
});

describe('email failures', () => {
  test('Gmail authentication failure returns 503, is not leaked and allows a retry', async () => {
    const smtp = await startFakeSmtp('auth_fail');
    try {
      const api = await start({ transport: smtpTransport(smtp.port) });
      const response = await api.post('/api/enquiries', validEnquiry());
      const raw = await response.text();
      const body = JSON.parse(raw);

      assert.equal(response.status, 503);
      assert.equal(body.error, 'email_unavailable');
      assert.match(body.message, /call or WhatsApp us/);
      assert.ok(!raw.includes(TEST_ENV.EMAIL_PASS));
      assert.ok(!raw.includes(TEST_ENV.EMAIL_USER));
      assert.ok(!raw.includes('535'));

      const health = await (await api.get('/api/health')).json();
      assert.deepEqual([health.status, health.mail], ['degraded', 'auth_failed']);

      const retry = await api.post('/api/enquiries', validEnquiry());
      assert.equal(retry.status, 503, 'a failed send must not be treated as a duplicate');
    } finally {
      await smtp.close();
    }
  });

  test('delivery failure returns 502 and keeps the enquiry retryable', async () => {
    const smtp = await startFakeSmtp('reject_data');
    try {
      const api = await start({ transport: smtpTransport(smtp.port) });
      const response = await api.post('/api/enquiries', validEnquiry());
      assert.equal(response.status, 502);
      assert.equal((await response.json()).error, 'email_failed');
      assert.equal((await api.post('/api/enquiries', validEnquiry())).status, 502);
    } finally {
      await smtp.close();
    }
  });

  test('network failures are reported as delivery failures', async () => {
    const error = Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNECTION' });
    const api = await start({ transport: stubTransport({ failWith: error }) });
    const response = await api.post('/api/enquiries', validEnquiry());
    assert.equal(response.status, 502);
  });

  test('successful delivery over SMTP produces a complete message', async () => {
    const smtp = await startFakeSmtp('accept');
    try {
      const api = await start({ transport: smtpTransport(smtp.port) });
      const response = await api.post('/api/enquiries', validEnquiry({ message: 'Fees & <timings>?' }));
      assert.equal(response.status, 200);
      assert.equal(smtp.messages.length, 1);
      const raw = smtp.messages[0];
      assert.match(raw, /^Subject: /m);
      assert.match(raw, /^Reply-To: "?Asha Sharma"? <asha@example\.com>/m);
      assert.match(raw, /Content-Type: multipart\/alternative/);
      const health = await (await api.get('/api/health')).json();
      assert.equal(health.mail, 'ready');
    } finally {
      await smtp.close();
    }
  });

  test('missing mail configuration returns 503', async () => {
    const api = await start({ env: { EMAIL_PASS: '' } });
    const response = await api.post('/api/enquiries', validEnquiry());
    assert.equal(response.status, 503);
    const health = await (await api.get('/api/health')).json();
    assert.equal(health.mail, 'not_configured');
  });
});

describe('HTTP behaviour', () => {
  test('health endpoint reports status without configuration details', async () => {
    const api = await start();
    const response = await api.get('/api/health');
    const raw = await response.text();
    assert.equal(response.status, 200);
    assert.deepEqual(Object.keys(JSON.parse(raw)).sort(), ['mail', 'status', 'uptimeSeconds']);
    assert.ok(!raw.includes('example.com'));
  });

  test('CORS allows configured origins only', async () => {
    const api = await start({ env: { ALLOWED_ORIGINS: 'https://www.maac.example' } });
    const allowed = await api.post('/api/enquiries', validEnquiry(), { Origin: 'https://www.maac.example' });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://www.maac.example');

    const preflight = await fetch(`${api.baseUrl}/api/enquiries`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://www.maac.example', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
    });
    assert.equal(preflight.status, 204);

    const blocked = await api.post('/api/enquiries', validEnquiry({ course: 'gaming' }), { Origin: 'https://evil.example' });
    assert.equal(blocked.status, 403);
    assert.equal((await blocked.json()).error, 'origin_not_allowed');
    assert.equal(blocked.headers.get('access-control-allow-origin'), null);
    assert.equal(api.transport.sent.length, 1);
  });

  test('development allows the local React dev server by default', async () => {
    const api = await start();
    const response = await api.post('/api/enquiries', validEnquiry(), { Origin: 'http://localhost:3000' });
    assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  });

  test('rejects malformed, non-JSON and oversized bodies', async () => {
    const api = await start();
    assert.equal((await api.post('/api/enquiries', '{"name":')).status, 400);
    const form = await fetch(`${api.baseUrl}/api/enquiries`, { method: 'POST', body: 'name=Asha', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    assert.equal(form.status, 415);
    assert.equal((await api.post('/api/enquiries', validEnquiry({ message: 'x'.repeat(20000) }))).status, 413);
  });

  test('production refuses plain HTTP but accepts HTTPS behind a proxy', async () => {
    const api = await start({ env: { NODE_ENV: 'production', ALLOWED_ORIGINS: 'https://www.maac.example' } });
    const insecure = await api.post('/api/enquiries', validEnquiry());
    assert.equal(insecure.status, 403);
    assert.equal((await insecure.json()).error, 'https_required');

    const secure = await api.post('/api/enquiries', validEnquiry(), { 'X-Forwarded-Proto': 'https' });
    assert.equal(secure.status, 200);
    assert.match(secure.headers.get('strict-transport-security'), /max-age=/);
    assert.equal((await api.get('/api/health')).status, 200, 'load balancer health checks may use HTTP');
  });

  test('sets security headers and returns JSON 404s', async () => {
    const api = await start();
    const response = await api.get('/nope');
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error, 'not_found');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-powered-by'), null);
  });
});
