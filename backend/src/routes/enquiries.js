const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { validateEnquiry, detectSpam } = require('../validation/enquiry');

const SUCCESS_MESSAGE = 'Thank you! Your enquiry has been sent. The MAAC Mathura team will contact you soon.';

/**
 * POST /api/enquiries (and the legacy POST /send-email).
 * Order: rate limit -> JSON only -> spam check -> validation -> duplicate check -> send.
 */
function createEnquiryRouter({ config, mailer, duplicateGuard, logger }) {
  const router = express.Router();

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      const resetTime = req.rateLimit?.resetTime;
      const retryAfterSeconds = resetTime ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000)) : undefined;
      logger.warn('enquiry.rate_limited');
      res.status(429).json({
        ok: false,
        error: 'rate_limited',
        message: 'Too many enquiries from this connection. Please try again later or call us.',
        retryAfterSeconds,
      });
    },
  });

  const requireJson = (req, res, next) => {
    if (!req.is('application/json')) {
      return res.status(415).json({ ok: false, error: 'unsupported_media_type', message: 'Send the enquiry as JSON.' });
    }
    return next();
  };

  const handleEnquiry = ({ requireTiming }) => async (req, res, next) => {
    try {
      const spamReason = detectSpam(req.body, { minFillMs: config.minFillMs, requireTiming });
      if (spamReason === 'too_fast') {
        // Autofill can make a real person this quick, so ask them to resend rather than drop it.
        logger.warn('enquiry.too_fast');
        return res.status(400).json({
          ok: false,
          error: 'too_fast',
          message: 'That was very quick. Please check your details and submit again.',
        });
      }
      if (spamReason) {
        logger.warn('enquiry.spam_dropped', { reason: spamReason });
        return res.status(200).json({ ok: true, message: SUCCESS_MESSAGE });
      }

      const { errors, enquiry } = validateEnquiry(req.body);
      if (errors) {
        return res.status(422).json({
          ok: false,
          error: 'validation_failed',
          message: 'Please correct the highlighted fields.',
          fields: errors,
        });
      }

      if (!duplicateGuard.claim(enquiry)) {
        logger.info('enquiry.duplicate', { course: enquiry.course });
        return res.status(200).json({
          ok: true,
          duplicate: true,
          message: 'We already have your enquiry. The MAAC Mathura team will contact you soon.',
        });
      }

      try {
        const result = await mailer.sendEnquiry(enquiry);
        logger.info('enquiry.sent', { course: enquiry.course, messageId: result.messageId });
        return res.status(200).json({ ok: true, message: SUCCESS_MESSAGE });
      } catch (error) {
        duplicateGuard.release(enquiry);
        throw error;
      }
    } catch (error) {
      return next(error);
    }
  };

  router.post('/api/enquiries', limiter, requireJson, handleEnquiry({ requireTiming: true }));
  // Kept for pages cached before the redesign; it does not require the form timing field.
  router.post('/send-email', limiter, requireJson, handleEnquiry({ requireTiming: false }));

  return router;
}

module.exports = { createEnquiryRouter };
