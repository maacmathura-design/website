const options = require('../enquiryOptions.json');

const LIMITS = { name: 80, email: 120, message: 1000, sourcePage: 300 };
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const URL_PATTERN = /(https?:\/\/|www\.)/gi;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const MAX_LINKS_IN_MESSAGE = 2;

const text = (value) => (typeof value === 'string' ? value.replace(CONTROL_CHARACTERS, '').trim() : '');
const singleLine = (value) => text(value).replace(/\s+/g, ' ');
const has = (map, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(map, key);

/** Accepts 10-digit Indian mobile numbers, optionally prefixed with +91, 91 or 0. */
function normaliseMobile(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const digits = String(value)
    .replace(/[\s()-]/g, '')
    .replace(/^(\+91|91|0)(?=\d{10}$)/, '');
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/**
 * Validates and normalises an enquiry body.
 * Returns `{ errors }` (field -> message) or `{ enquiry }` containing only known, cleaned fields.
 */
function validateEnquiry(body) {
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

/**
 * Returns a reason when a submission looks automated, otherwise null.
 * Spam is answered like a success so bots get no signal, but nothing is emailed.
 */
function detectSpam(body, { minFillMs, requireTiming }) {
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

module.exports = { validateEnquiry, detectSpam, normaliseMobile, LIMITS };
