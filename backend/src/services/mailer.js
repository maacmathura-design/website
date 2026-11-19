const nodemailer = require('nodemailer');
const { buildEnquiryEmail } = require('./enquiryEmail');

const SEND_TIMEOUT_MS = 20000;

class MailError extends Error {
  /**
   * @param {'not_configured' | 'auth_failed' | 'delivery_failed'} kind
   * @param {string} [code] Nodemailer/SMTP code, safe to log (never contains credentials).
   */
  constructor(kind, code) {
    super(`Email ${kind.replace('_', ' ')}${code ? ` (${code})` : ''}`);
    this.name = 'MailError';
    this.kind = kind;
    this.code = code;
  }
}

/** Gmail answers bad credentials with SMTP 535; Nodemailer reports it as EAUTH. */
function classifyMailError(error) {
  const code = error?.code || (error?.responseCode ? `SMTP ${error.responseCode}` : undefined);
  if (error?.code === 'EAUTH' || error?.responseCode === 535 || error?.responseCode === 534) {
    return new MailError('auth_failed', code);
  }
  return new MailError('delivery_failed', code);
}

/**
 * Sends enquiry notifications through Gmail SMTP.
 * `transport` can be injected for tests; otherwise a Gmail transport is created from config.
 */
function createMailer(config, { transport } = {}) {
  const configured = config.missingMailVariables.length === 0;
  const transporter =
    transport ||
    (configured
      ? nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: config.mail.user, pass: config.mail.pass },
          connectionTimeout: SEND_TIMEOUT_MS,
          greetingTimeout: SEND_TIMEOUT_MS,
          socketTimeout: SEND_TIMEOUT_MS,
        })
      : null);

  let status = configured ? 'unverified' : 'not_configured';

  async function verify() {
    if (!transporter) return status;
    try {
      await transporter.verify();
      status = 'ready';
    } catch (error) {
      status = classifyMailError(error).kind === 'auth_failed' ? 'auth_failed' : 'unreachable';
    }
    return status;
  }

  async function sendEnquiry(enquiry) {
    if (!transporter) throw new MailError('not_configured');
    const { subject, text, html } = buildEnquiryEmail(enquiry);
    let info;
    try {
      info = await transporter.sendMail({
        from: { name: 'MAAC Mathura Website', address: config.mail.user },
        to: config.mail.recipient,
        replyTo: { name: enquiry.name, address: enquiry.email },
        subject,
        text,
        html,
      });
    } catch (error) {
      const mailError = classifyMailError(error);
      status = mailError.kind === 'auth_failed' ? 'auth_failed' : 'unreachable';
      throw mailError;
    }
    status = 'ready';
    const accepted = info.accepted?.length ?? 0;
    if (accepted === 0) throw new MailError('delivery_failed', 'RECIPIENT_REJECTED');
    return { messageId: info.messageId, accepted };
  }

  return {
    verify,
    sendEnquiry,
    get status() {
      return status;
    },
  };
}

module.exports = { createMailer, classifyMailError, MailError };
