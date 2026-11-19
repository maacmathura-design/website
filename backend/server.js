const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const { loadConfig } = require('./src/config');
const { createApp } = require('./src/app');
const { createMailer } = require('./src/services/mailer');
const { logger } = require('./src/logger');

const config = loadConfig();

if (config.missingMailVariables.length > 0) {
  logger.error('config.missing_mail_variables', { variables: config.missingMailVariables });
  if (config.production) process.exit(1);
}
if (config.production && config.allowedOrigins.length === 0) {
  logger.error('config.missing_allowed_origins', { variables: ['ALLOWED_ORIGINS'] });
  process.exit(1);
}

const mailer = createMailer(config);
const websiteRoot = path.join(__dirname, '..', 'frontend', 'build');
const serveWebsite = process.env.SERVE_STATIC !== 'false' && fs.existsSync(path.join(websiteRoot, 'index.html'));
if (config.production && !serveWebsite) {
  logger.error('server.website_missing', { expected: 'frontend/build/index.html' });
}

const app = createApp({ config, mailer, logger, staticRoot: serveWebsite ? websiteRoot : undefined });

const server = app.listen(config.port, () => {
  logger.info('server.started', {
    port: config.port,
    production: config.production,
    allowedOrigins: config.allowedOrigins,
    requireHttps: config.requireHttps,
    website: serveWebsite,
  });
  mailer.verify().then((status) => {
    const log = status === 'ready' ? logger.info : logger.error;
    log('mail.verify', { status });
  });
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('unhandledRejection', (error) => {
  logger.error('process.unhandled_rejection', { name: error?.name, message: error?.message });
});
process.on('uncaughtException', (error) => {
  logger.error('process.uncaught_exception', { name: error?.name, message: error?.message });
  shutdown();
});
