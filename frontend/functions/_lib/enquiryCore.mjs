import tls from 'node:tls';
import nodemailer from 'nodemailer';
import options from './enquiryOptions.mjs';

const LIMITS = { name: 80, email: 120, message: 1000, sourcePage: 300, bodyBytes: 10 * 1024 };
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const URL_PATTERN = /(https?:\/\/|www\.)/gi;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const MAX_LINKS_IN_MESSAGE = 2;
const MAX_DUPLICATE_ENTRIES = 5000;
const SUCCESS_MESSAGE = 'Thank you! Your enquiry has been sent. The MAAC Mathura team will contact you soon.';
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

const text = (value) => (typeof value === 'string' ? value.replace(CONTROL_CHARACTERS, '').trim() : '');
const singleLine = (value) => text(value).replace(/\s+/g, ' ');
const has = (map, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(map, key);

/** Accepts 10-digit Indian mobile numbers, optionally prefixed with +91, 91 or 0. */
export function normaliseMobile(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const digits = String(value)
    .replace(/[\s()-]/g, '')
    .replace(/^(\+91|91|0)(?=\d{10}$)/, '');
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export function validateEnquiry(body) {
  const input = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const errors = {};

  const name = singleLine(input.name);
  if (!name) errors.name = 'Please enter your name.';
  else if (name.length < 2) errors.name = 'Name must be at least 2 characters.';
  else if (name.length > LIMITS.name) errors.name = `Name must be at most ${LIMITS.name} characters.`;
  else if (!NAME_PATTERN.test(name)) errors.name = 'Name can contain letters, spaces, dots, hyphens and apostrophes only.';

  const rawMobile = typeof input.mobile === 'number' ? String(input.mobile) : text(input.mobile);
  const mobile = normaliseMobile(rawMobile);
  if (!rawMobile) errors.mobile = 'Please enter your mobile number.';
  else if (!mobile) errors.mobile = 'Enter a valid 10-digit Indian mobile number.';

  const email = singleLine(input.email).toLowerCase();
  if (!email) errors.email = 'Please enter your email address.';
  else if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';

  const course = text(input.course);
  if (!course) errors.course = 'Please choose a course.';
  else if (!has(options.courses, course)) errors.course = 'Please choose a course from the list.';

  const qualification = text(input.qualification);
  if (qualification && !has(options.qualifications, qualification)) errors.qualification = 'Please choose a qualification from the list.';

  const callbackTime = text(input.callbackTime);
  if (callbackTime && !has(options.callbackTimes, callbackTime)) errors.callbackTime = 'Please choose a callback time from the list.';

  const message = text(input.message).replace(/\r\n?/g, '\n');
  if (message.length > LIMITS.message) errors.message = `Message must be at most ${LIMITS.message} characters.`;

  const sourcePage = singleLine(input.sourcePage);
  if (sourcePage && (sourcePage.length > LIMITS.sourcePage || !sourcePage.startsWith('/') || sourcePage.startsWith('//'))) {
    errors.sourcePage = 'Invalid source page.';
  }

  const formLocation = text(input.formLocation);
  if (formLocation && !has(options.formLocations, formLocation)) errors.formLocation = 'Invalid form location.';

  if (Object.keys(errors).length > 0) return { errors };

  return {
    enquiry: {
      name,
      mobile,
      email,
      course,
      qualification: qualification || null,
      callbackTime: callbackTime || null,
      message: message || null,
      sourcePage: sourcePage || null,
      formLocation: formLocation || null,
    },
  };
}

/** Spam is answered like a success so bots get no signal, but nothing is emailed. */
export function detectSpam(body, { minFillMs, requireTiming }) {
  const input = body && typeof body === 'object' ? body : {};
  if (typeof input.website === 'string' && input.website.trim() !== '') return 'honeypot';

  const elapsed = input.elapsedMs;
  if (elapsed === undefined || elapsed === null) {
    if (requireTiming) return 'missing_timing';
  } else if (typeof elapsed !== 'number' || !Number.isFinite(elapsed) || elapsed < minFillMs) {
    return 'too_fast';
  }

  const countLinks = (value) => (text(value).match(URL_PATTERN) || []).length;
  if (countLinks(input.name) > 0 || countLinks(input.message) > MAX_LINKS_IN_MESSAGE) return 'links';
  return null;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

function formatTimestamp(date) {
  return `${new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)} IST`;
}

function formatMobile(mobile) {
  return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
}

export function buildEnquiryEmail(enquiry, { submittedAt = new Date(), siteName = 'MAAC Mathura' } = {}) {
  const courseLabel = options.courses[enquiry.course] || enquiry.course;
  const rows = [
    ['Student name', enquiry.name],
    ['Mobile number', formatMobile(enquiry.mobile)],
    ['Email address', enquiry.email],
    ['Course interested in', courseLabel],
    ['Educational qualification', enquiry.qualification ? options.qualifications[enquiry.qualification] : 'Not provided'],
    ['Preferred callback time', enquiry.callbackTime ? options.callbackTimes[enquiry.callbackTime] : 'Not provided'],
    ['Message', enquiry.message || 'Not provided'],
    ['Source page', enquiry.sourcePage || 'Not provided'],
    ['Submitted from', enquiry.formLocation ? options.formLocations[enquiry.formLocation] : 'Not provided'],
    ['Submitted at', formatTimestamp(submittedAt)],
  ];
  const subject = `New admission enquiry: ${courseLabel} – ${enquiry.name}`.replace(/[\r\n]+/g, ' ');
  const plain = [
    `New admission enquiry from the ${siteName} website`,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Reply to this email to respond to the student directly.',
  ].join('\n');
  const telHref = `tel:+91${enquiry.mobile}`;
  const htmlRows = rows
    .map(([label, value]) => {
      let cell = escapeHtml(value).replace(/\n/g, '<br>');
      if (label === 'Mobile number') cell = `<a href="${escapeHtml(telHref)}" style="color:#1a1a1a;">${cell}</a>`;
      if (label === 'Email address') cell = `<a href="mailto:${escapeHtml(enquiry.email)}" style="color:#1a1a1a;">${cell}</a>`;
      return `<tr><th scope="row" align="left" valign="top" style="padding:10px 16px;border-bottom:1px solid #ececec;width:38%;font-weight:600;color:#555;">${escapeHtml(label)}</th><td valign="top" style="padding:10px 16px;border-bottom:1px solid #ececec;color:#1a1a1a;">${cell}</td></tr>`;
    })
    .join('');
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:8px;border-collapse:separate;overflow:hidden;"><tr><td style="padding:20px 16px;background:#16171b;color:#ffffff;"><div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#f2c94c;">${escapeHtml(siteName)} website</div><div style="font-size:20px;font-weight:700;margin-top:4px;">New admission enquiry</div></td></tr><tr><td style="padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${htmlRows}</table></td></tr><tr><td style="padding:16px;color:#666;font-size:13px;">Reply to this email to respond to the student directly.</td></tr></table></body></html>`;
  return { subject, text: plain, html };
}

async function digestKey({ mobile, email, course }) {
  const bytes = new TextEncoder().encode(`${mobile}|${email}|${course}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createDuplicateGuard({ windowMs, now }) {
  const entries = new Map();
  const prune = () => {
    const current = now();
    for (const [key, expiresAt] of entries) {
      if (expiresAt <= current) entries.delete(key);
    }
    while (entries.size > MAX_DUPLICATE_ENTRIES) entries.delete(entries.keys().next().value);
  };
  return {
    async claim(enquiry) {
      prune();
      const key = await digestKey(enquiry);
      if (entries.has(key)) return false;
      entries.set(key, now() + windowMs);
      return true;
    },
    async release(enquiry) {
      entries.delete(await digestKey(enquiry));
    },
  };
}

function createRateLimiter({ windowMs, max, now }) {
  const hits = new Map();
  return {
    take(ip) {
      const current = now();
      const entry = hits.get(ip);
      if (!entry || entry.resetAt <= current) {
        hits.set(ip, { count: 1, resetAt: current + windowMs });
        return { allowed: true };
      }
      if (entry.count >= max) {
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - current) / 1000)) };
      }
      entry.count += 1;
      return { allowed: true };
    },
  };
}

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...headers,
    },
  });
}

function log(level, event, fields = {}) {
  const line = JSON.stringify({ time: new Date().toISOString(), level, event, ...fields });
  if (level === 'error') console.error(line);
  else console.log(line);
}

function mailConfigured(env) {
  return Boolean(env?.RESEND_API_KEY && env?.ENQUIRY_TO_EMAIL && env?.ENQUIRY_FROM_EMAIL);
}

const SMTP_HOST = 'smtp.gmail.com';

function isAuthFailure(error) {
  return error?.code === 'EAUTH' || error?.responseCode === 535 || error?.responseCode === 534;
}

async function deliverWithGmail(message, env) {
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: 465,
    secure: true,
    auth: { user: env.ENQUIRY_FROM_EMAIL, pass: env.RESEND_API_KEY },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: true, servername: SMTP_HOST },
    getSocket(_options, callback) {
      const socket = tls.connect({ host: SMTP_HOST, port: 465, servername: SMTP_HOST, rejectUnauthorized: true });
      socket.once('secureConnect', () => callback(null, { connection: socket, secured: true }));
      socket.once('error', (error) => callback(error));
    },
  });
  try {
    return await transport.sendMail(message);
  } finally {
    transport.close();
  }
}

function clientIp(request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

async function sendWithGmail(enquiry, env, sendImpl) {
  const { subject, text: plain, html } = buildEnquiryEmail(enquiry);
  const message = {
    from: env.ENQUIRY_FROM_EMAIL,
    to: env.ENQUIRY_TO_EMAIL,
    replyTo: enquiry.email,
    subject,
    text: plain,
    html,
  };
  try {
    const info = await sendImpl(message, env);
    return { ok: true, id: info?.messageId || null };
  } catch (error) {
    const authFailed = isAuthFailure(error);
    log('error', 'enquiry.email_error', {
      kind: authFailed ? 'auth_failed' : 'delivery_failed',
      code: error?.code || null,
      responseCode: error?.responseCode || null,
    });
    return { ok: false, status: authFailed ? 503 : 502, error: authFailed ? 'email_unavailable' : 'email_failed' };
  }
}

/**
 * Pages Function handler. `sendImpl` is injectable so tests never open SMTP.
 * RESEND_API_KEY is the existing Pages secret and holds the Gmail app password.
 * Its value is not written to the response or the log.
 */
export function createEnquiryRuntime({
  now = () => Date.now(),
  sendImpl = deliverWithGmail,
  windowMs = 15 * 60 * 1000,
  max = 5,
  duplicateWindowMs = 10 * 60 * 1000,
  minFillMs = 2000,
} = {}) {
  const rate = createRateLimiter({ windowMs, max, now });
  const duplicates = createDuplicateGuard({ windowMs: duplicateWindowMs, now });

  const health = (env) => {
    const configured = mailConfigured(env);
    return json(200, {
      status: configured ? 'ok' : 'degraded',
      mail: configured ? 'configured' : 'not_configured',
      delivery: 'not_checked',
    });
  };

  const handle = async (request, env, { requireTiming = true } = {}) => {
    const limit = rate.take(clientIp(request));
    if (!limit.allowed) {
      log('warn', 'enquiry.rate_limited');
      return json(429, {
        ok: false,
        error: 'rate_limited',
        message: 'Too many enquiries from this connection. Please try again later or call us.',
        retryAfterSeconds: limit.retryAfterSeconds,
      }, { 'retry-after': String(limit.retryAfterSeconds) });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return json(415, { ok: false, error: 'unsupported_media_type', message: 'Send the enquiry as JSON.' });
    }
    const declaredLength = Number(request.headers.get('content-length'));
    if (Number.isFinite(declaredLength) && declaredLength > LIMITS.bodyBytes) {
      return json(413, { ok: false, error: 'payload_too_large', message: 'The enquiry is too large.' });
    }

    let raw;
    try {
      raw = await request.text();
    } catch {
      return json(400, { ok: false, error: 'invalid_json', message: 'The request body is not valid JSON.' });
    }
    if (raw.length > LIMITS.bodyBytes) {
      return json(413, { ok: false, error: 'payload_too_large', message: 'The enquiry is too large.' });
    }
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, error: 'invalid_json', message: 'The request body is not valid JSON.' });
    }

    const spamReason = detectSpam(body, { minFillMs, requireTiming });
    if (spamReason === 'too_fast') {
      log('warn', 'enquiry.too_fast');
      return json(400, { ok: false, error: 'too_fast', message: 'That was very quick. Please check your details and submit again.' });
    }
    if (spamReason) {
      log('warn', 'enquiry.spam_dropped', { reason: spamReason });
      return json(200, { ok: true, message: SUCCESS_MESSAGE });
    }

    const { errors, enquiry } = validateEnquiry(body);
    if (errors) {
      return json(422, { ok: false, error: 'validation_failed', message: 'Please correct the highlighted fields.', fields: errors });
    }

    if (!(await duplicates.claim(enquiry))) {
      log('info', 'enquiry.duplicate', { course: enquiry.course });
      return json(200, {
        ok: true,
        duplicate: true,
        message: 'We already have your enquiry. The MAAC Mathura team will contact you soon.',
      });
    }

    if (!mailConfigured(env)) {
      await duplicates.release(enquiry);
      log('error', 'enquiry.email_error', { kind: 'not_configured' });
      return json(503, {
        ok: false,
        error: 'email_unavailable',
        message: 'Sorry, we could not send your enquiry right now. Please try again in a few minutes, or call or WhatsApp us.',
      });
    }

    const sent = await sendWithGmail(enquiry, env, sendImpl);
    if (!sent.ok) {
      await duplicates.release(enquiry);
      return json(sent.status, {
        ok: false,
        error: sent.error,
        message: 'Sorry, we could not send your enquiry right now. Please try again in a few minutes, or call or WhatsApp us.',
      });
    }

    log('info', 'enquiry.sent', { course: enquiry.course, messageId: sent.id || null });
    return json(200, { ok: true, message: SUCCESS_MESSAGE });
  };

  return { handle, health };
}

const runtime = createEnquiryRuntime();

export function handleEnquiry(context, options) {
  return runtime.handle(context.request, context.env, options);
}

export function enquiryHealth(context) {
  return runtime.health(context.env);
}
