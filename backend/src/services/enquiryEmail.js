const options = require('../enquiryOptions.json');

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

const NOT_PROVIDED = 'Not provided';

const formatTimestamp = (date) =>
  `${new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)} IST`;

const formatMobile = (mobile) => `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;

/** Builds the subject, plain-text and HTML bodies for an enquiry notification. */
function buildEnquiryEmail(enquiry, { submittedAt = new Date(), siteName = 'MAAC Mathura' } = {}) {
  const courseLabel = options.courses[enquiry.course] || enquiry.course;
  const rows = [
    ['Student name', enquiry.name],
    ['Mobile number', formatMobile(enquiry.mobile)],
    ['Email address', enquiry.email],
    ['Course interested in', courseLabel],
    ['Educational qualification', enquiry.qualification ? options.qualifications[enquiry.qualification] : NOT_PROVIDED],
    ['Preferred callback time', enquiry.callbackTime ? options.callbackTimes[enquiry.callbackTime] : NOT_PROVIDED],
    ['Message', enquiry.message || NOT_PROVIDED],
    ['Source page', enquiry.sourcePage || NOT_PROVIDED],
    ['Submitted from', enquiry.formLocation ? options.formLocations[enquiry.formLocation] : NOT_PROVIDED],
    ['Submitted at', formatTimestamp(submittedAt)],
  ];

  // Subjects are a single header line; the name is already single-line after validation.
  const subject = `New admission enquiry: ${courseLabel} – ${enquiry.name}`.replace(/[\r\n]+/g, ' ');

  const text = [
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
      return `<tr>
        <th scope="row" align="left" valign="top" style="padding:10px 16px;border-bottom:1px solid #ececec;width:38%;font-weight:600;color:#555;">${escapeHtml(label)}</th>
        <td valign="top" style="padding:10px 16px;border-bottom:1px solid #ececec;color:#1a1a1a;">${cell}</td>
      </tr>`;
    })
    .join('');

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:8px;border-collapse:separate;overflow:hidden;">
    <tr>
      <td style="padding:20px 16px;background:#16171b;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#f2c94c;">${escapeHtml(siteName)} website</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px;">New admission enquiry</div>
      </td>
    </tr>
    <tr>
      <td style="padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${htmlRows}</table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px;color:#666;font-size:13px;">Reply to this email to respond to the student directly.</td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

module.exports = { buildEnquiryEmail, escapeHtml };
