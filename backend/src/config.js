const MAIL_VARIABLES = ['EMAIL_USER', 'EMAIL_PASS', 'RECIPIENT_EMAIL'];
const DEVELOPMENT_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

const list = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim().replace(/\/+$/, ''))
    .filter(Boolean);

const integer = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

/** `TRUST_PROXY` accepts a hop count ("1"), "true"/"false", or an Express trust-proxy list. */
const trustProxy = (value, production) => {
  if (value === undefined || value === '') return production ? 1 : false;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
};

/** Reads configuration from the environment. Secrets stay in this object and are never logged. */
function loadConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const allowedOrigins = list(env.ALLOWED_ORIGINS);

  return {
    production,
    port: integer(env.PORT, 5050),
    allowedOrigins: allowedOrigins.length > 0 || production ? allowedOrigins : DEVELOPMENT_ORIGINS,
    trustProxy: trustProxy(env.TRUST_PROXY, production),
    requireHttps: env.REQUIRE_HTTPS ? env.REQUIRE_HTTPS === 'true' : production,
    rateLimit: {
      windowMs: integer(env.ENQUIRY_RATE_LIMIT_WINDOW_MINUTES, 15) * 60 * 1000,
      max: integer(env.ENQUIRY_RATE_LIMIT_MAX, 5),
    },
    duplicateWindowMs: integer(env.ENQUIRY_DUPLICATE_WINDOW_MINUTES, 10) * 60 * 1000,
    minFillMs: integer(env.ENQUIRY_MIN_FILL_SECONDS, 2) * 1000,
    mail: {
      user: env.EMAIL_USER || '',
      pass: env.EMAIL_PASS || '',
      recipient: env.RECIPIENT_EMAIL || '',
    },
    missingMailVariables: MAIL_VARIABLES.filter((name) => !env[name]),
  };
}

module.exports = { loadConfig };
