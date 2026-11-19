const express = require('express');
const cors = require('cors');
const { createEnquiryRouter } = require('./routes/enquiries');
const { createHealthRouter } = require('./routes/health');
const { createDuplicateGuard } = require('./services/duplicateGuard');
const { MailError } = require('./services/mailer');
const { documentContentSecurityPolicy, inlineScriptHashes, mountWebsite } = require('./website');

const HEALTH_PATHS = new Set(['/api/health', '/health']);

class HttpError extends Error {
  constructor(status, error, message) {
    super(message);
    this.status = status;
    this.error = error;
  }
}

function isApiPath(req) {
  return req.path === '/health' || req.path.startsWith('/api');
}

function securityHeaders(config, { documents }) {
  const documentPolicy = documents ? documentContentSecurityPolicy(config) : '';
  return (req, res, next) => {
    const api = !documents || isApiPath(req);
    res.set(api ? {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'Cache-Control': 'no-store',
    } : {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': documentPolicy,
    });
    if (config.requireHttps) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  };
}

/** Behind a proxy, `req.secure` relies on X-Forwarded-Proto and the TRUST_PROXY setting. */
function requireHttps(config) {
  return (req, res, next) => {
    if (!config.requireHttps || req.secure || HEALTH_PATHS.has(req.path)) return next();
    return next(new HttpError(403, 'https_required', 'This API is only available over HTTPS.'));
  };
}

function corsMiddleware(config) {
  const allowed = new Set(config.allowedOrigins);
  return cors({
    // Requests without an Origin header (same-origin, server-to-server, health checks) are allowed.
    origin: (origin, callback) => {
      if (!origin || allowed.has(origin)) return callback(null, true);
      return callback(new HttpError(403, 'origin_not_allowed', 'This origin may not use the enquiry API.'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: 600,
  });
}

function errorHandler(logger) {
  // eslint-disable-next-line no-unused-vars
  return (error, req, res, next) => {
    if (error instanceof MailError) {
      logger.error('enquiry.email_error', { kind: error.kind, code: error.code });
      const unavailable = error.kind === 'not_configured' || error.kind === 'auth_failed';
      return res.status(unavailable ? 503 : 502).json({
        ok: false,
        error: unavailable ? 'email_unavailable' : 'email_failed',
        message: 'Sorry, we could not send your enquiry right now. Please try again in a few minutes, or call or WhatsApp us.',
      });
    }
    if (error instanceof HttpError) {
      return res.status(error.status).json({ ok: false, error: error.error, message: error.message });
    }
    if (error?.type === 'entity.parse.failed') {
      return res.status(400).json({ ok: false, error: 'invalid_json', message: 'The request body is not valid JSON.' });
    }
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({ ok: false, error: 'payload_too_large', message: 'The enquiry is too large.' });
    }
    logger.error('request.unhandled_error', { name: error?.name, message: error?.message });
    return res.status(500).json({ ok: false, error: 'internal_error', message: 'Something went wrong. Please try again or call us.' });
  };
}

/** Builds the Express app. Dependencies are injected so tests can replace the mailer. */
function createApp({ config, mailer, logger, staticRoot, duplicateGuard = createDuplicateGuard({ windowMs: config.duplicateWindowMs }) }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  const websiteConfig = staticRoot
    ? { ...config, inlineScriptHashes: inlineScriptHashes(staticRoot) }
    : config;
  app.use(securityHeaders(websiteConfig, { documents: Boolean(staticRoot) }));
  app.use(requireHttps(config));
  app.use(corsMiddleware(config));
  app.use(express.json({ limit: '10kb', strict: true }));

  app.use(createHealthRouter({ mailer }));
  app.use(createEnquiryRouter({ config, mailer, duplicateGuard, logger }));
  if (staticRoot) mountWebsite(app, staticRoot);

  app.use((req, res) => res.status(404).json({ ok: false, error: 'not_found', message: 'Not found.' }));
  app.use(errorHandler(logger));
  return app;
}

module.exports = { createApp };
