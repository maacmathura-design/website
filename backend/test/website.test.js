const { test, describe, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { startApp } = require('./helpers/testApp');
const { scriptHash } = require('../src/website');

const themeScript = '(function () { document.documentElement.setAttribute("data-theme", "dark"); })();';

let running = [];
let directories = [];

const start = async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'maac-site-'));
  directories.push(root);
  fs.mkdirSync(path.join(root, 'static'));
  fs.writeFileSync(path.join(root, 'static', 'main.js'), 'console.log("maac");\n');
  fs.writeFileSync(path.join(root, 'favicon.ico'), 'icon');
  fs.writeFileSync(path.join(root, 'index.html'), `<!DOCTYPE html><script>${themeScript}</script><div id="root"></div>`);
  const instance = await startApp({ staticRoot: root });
  running.push(instance);
  return instance;
};

afterEach(async () => {
  await Promise.all(running.map((instance) => instance.close()));
  running = [];
  for (const directory of directories) fs.rmSync(directory, { recursive: true, force: true });
  directories = [];
});

describe('production website hosting', () => {
  test('client routes return the React app and API routes stay JSON', async () => {
    const api = await start();
    const home = await api.get('/');
    const about = await api.get('/About');
    const course = await api.get('/3DAnimation');
    const asset = await api.get('/static/main.js');
    const icon = await api.get('/favicon.ico');
    const missingAsset = await api.get('/missing.js');
    const health = await api.get('/api/health');
    const unknownApi = await api.get('/api/unknown');

    assert.equal(home.status, 200);
    assert.match(await home.text(), /id="root"/);
    assert.equal(home.headers.get('cache-control'), 'no-cache');
    assert.match(home.headers.get('content-security-policy'), /default-src 'self'/);
    assert.match(home.headers.get('content-security-policy'), new RegExp(scriptHash(themeScript).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

    assert.equal(about.status, 200);
    assert.match(await about.text(), /id="root"/);
    assert.equal(course.status, 200);

    assert.equal(asset.status, 200);
    assert.match(await asset.text(), /maac/);
    assert.match(asset.headers.get('cache-control'), /immutable/);

    assert.equal(icon.status, 200);
    assert.equal(missingAsset.status, 404);
    assert.equal((await missingAsset.json()).error, 'not_found');

    assert.equal(health.status, 200);
    assert.equal(health.headers.get('cache-control'), 'no-store');
    assert.match(health.headers.get('content-security-policy'), /default-src 'none'/);
    assert.equal(unknownApi.status, 404);
    assert.equal((await unknownApi.json()).error, 'not_found');
  });
});
