/**
 * Runs before `npm run build`. The enquiry form always posts to /api/enquiries on the same
 * origin. REACT_APP_API_URL is no longer read by the form.
 */
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
require('react-scripts/config/env');

const url = (process.env.REACT_APP_API_URL || '').trim();

if (url) {
  console.warn('REACT_APP_API_URL is ignored. The enquiry form always posts to /api/enquiries.');
} else {
  console.log('Enquiry form posts to /api/enquiries on the same origin.');
}
