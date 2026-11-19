const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

/** CSP hash of an inline script. The browser hashes the exact source between the script tags. */
function scriptHash(source) {
  return `'sha256-${crypto.createHash('sha256').update(source, 'utf8').digest('base64')}'`;
}

function inlineScriptHashes(staticRoot) {
  const html = fs.readFileSync(path.join(staticRoot, 'index.html'), 'utf8');
  return [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => scriptHash(match[1]));
}

function documentContentSecurityPolicy(config) {
  const connect = ["'self'", ...(config.allowedOrigins || [])].join(' ');
  const scripts = ["'self'", ...(config.inlineScriptHashes || [])].join(' ');
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${connect}`,
    `script-src ${scripts}`,
    "style-src 'self' 'unsafe-inline'",
  ].join('; ');
}

/**
 * Serves the Create React App build. Extensionless GET paths (React Router) return
 * index.html. Missing files that have an extension stay 404s, so a bad asset URL
 * is not disguised as the homepage.
 */
function mountWebsite(app, staticRoot) {
  const indexFile = path.join(staticRoot, 'index.html');

  app.use(express.static(staticRoot, {
    index: false,
    redirect: false,
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}static${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path === '/health' || req.path.startsWith('/api')) return next();
    if (path.extname(req.path)) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(indexFile, (error) => {
      if (error) next(error);
    });
  });
}

module.exports = { documentContentSecurityPolicy, inlineScriptHashes, mountWebsite, scriptHash };
