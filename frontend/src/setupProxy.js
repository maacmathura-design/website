// Development only (CRA loads this file in `npm start`, never in builds): forwards /api to the
// Express enquiry API. Production posts to the same /api path, served by Cloudflare Pages Functions.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(
    createProxyMiddleware('/api', {
      target: process.env.API_PROXY_TARGET || 'http://localhost:5050',
      changeOrigin: true,
      logLevel: 'warn',
    }),
  );
};
