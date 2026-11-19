const nodemailer = require('nodemailer');
const { loadConfig } = require('../../src/config');
const { createApp } = require('../../src/app');
const { createMailer } = require('../../src/services/mailer');
const { silentLogger } = require('../../src/logger');

const TEST_ENV = {
  NODE_ENV: 'test',
  EMAIL_USER: 'sender@example.com',
  EMAIL_PASS: 'test-app-password-not-real',
  RECIPIENT_EMAIL: 'admissions@example.com',
  ENQUIRY_RATE_LIMIT_MAX: '100',
};

const validEnquiry = (overrides = {}) => ({
  name: 'Asha Sharma',
  mobile: '+91 98765 43210',
  email: 'Asha@Example.com',
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

/** Transport stub that records messages, or fails with the given Nodemailer-style error. */
function stubTransport({ failWith } = {}) {
  const sent = [];
  return {
    sent,
    verify: async () => true,
    sendMail: async (message) => {
      if (failWith) throw failWith;
      sent.push(message);
      return { messageId: `<test-${sent.length}@example.com>`, accepted: [message.to], rejected: [] };
    },
  };
}

/** Nodemailer transport pointed at the fake SMTP server, to exercise real Nodemailer errors. */
const smtpTransport = (port) =>
  nodemailer.createTransport({
    host: '127.0.0.1',
    port,
    secure: false,
    ignoreTLS: true,
    auth: { user: TEST_ENV.EMAIL_USER, pass: TEST_ENV.EMAIL_PASS },
  });

async function startApp({ env = {}, config: configOverrides = {}, transport = stubTransport(), staticRoot } = {}) {
  const config = { ...loadConfig({ ...TEST_ENV, ...env }), ...configOverrides };
  const mailer = createMailer(config, { transport: config.missingMailVariables.length ? undefined : transport });
  const app = createApp({ config, mailer, logger: silentLogger, staticRoot });
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const post = (path, body, headers = {}) =>
    fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });

  return {
    baseUrl,
    transport,
    mailer,
    post,
    get: (path, headers = {}) => fetch(`${baseUrl}${path}`, { headers }),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

module.exports = { startApp, stubTransport, smtpTransport, validEnquiry, TEST_ENV };
