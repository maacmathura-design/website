const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const routesFile = fs.readFileSync(path.join(root, 'src/routes.js'), 'utf8');
const paths = [...routesFile.matchAll(/:\s*'(\/[^']*)'/g)].map((match) => match[1]);
if (!paths.includes('/')) paths.unshift('/');

const site = (process.env.REACT_APP_SITE_URL || '').trim().replace(/\/+$/, '');
const robots = ['User-agent: *', 'Allow: /', ''];

if (!site) {
  fs.rmSync(path.join(root, 'public/sitemap.xml'), { force: true });
  fs.writeFileSync(path.join(root, 'public/robots.txt'), `${robots.join('\n')}\n`);
  console.warn('REACT_APP_SITE_URL is unset, so sitemap.xml was not written. Set it to the public https origin.');
  process.exit(0);
}

const body = paths
  .map((route) => `  <url><loc>${site}${route === '/' ? '/' : route}</loc></url>`)
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'public/sitemap.xml'), xml);
robots.push(`Sitemap: ${site}/sitemap.xml`, '');
fs.writeFileSync(path.join(root, 'public/robots.txt'), `${robots.join('\n')}\n`);
console.log(`Wrote sitemap.xml and robots.txt for ${site} (${paths.length} URLs).`);
