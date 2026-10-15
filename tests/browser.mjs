// Tests built HTML with a real browser. The temporary server uses an OS-assigned
// loopback port: it never takes over the user's 3030 or 8040 services.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {checkBrand} from './brand.mjs';
const base = process.env.DOCS_BASE_URL ?? '/';
const preview = process.env.DOCS_PREVIEW === '1';
const root = path.resolve(process.env.DOCS_BUILD_DIR ?? 'build');
const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2'};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith(base)) { res.writeHead(404).end(); return; }
    const relative = decodeURIComponent(url.pathname.slice(base.length));
    let file = path.resolve(root, relative);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) { res.writeHead(403).end(); return; }
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.setHeader('Content-Type', types[path.extname(file)] ?? 'application/octet-stream');
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = `${origin}${base}`;
let browser;
try {
  browser = await chromium.launch({headless: true});
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  await page.goto(url, {waitUntil: 'networkidle'});
  assert.equal(await page.locator('h1').innerText(), 'Mo documentation');
  assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), preview ? 1 : 0);
  const sidebar = page.locator('.theme-doc-sidebar-menu');
  const topLabels = await sidebar.locator(':scope > li > a, :scope > li > .menu__list-item-collapsible > a').allTextContents();
  assert.deepEqual(topLabels, ['Mo documentation', 'Mo 62A', 'Mo 68A', 'Accessories', 'Works with Mo', 'Security']);
  assert.equal(await page.locator('.theme-doc-markdown a.card').count(), 5);
  assert.ok((await page.locator('.theme-doc-markdown').innerText()).includes('All sections'));
  const table = page.getByRole('region', {name: 'Product specifications'});
  assert.deepEqual(await table.locator('thead th').allTextContents(), ['', 'Mo62A', 'Mo68A']);
  for (const board of ['mo-62a', 'mo-68a']) assert.equal(await table.locator('a[href$="/' + board + '/getting-started/"]').count(), 1);
  const portal = (process.env.DEVELOPER_PORTAL_URL ?? 'https://www.inhand.com/developer').replace(/\/$/, '');
  assert.equal(await page.getByRole('link', {name: 'Compare the boards', exact: true}).getAttribute('href'), portal + '/hardware#compare');
  for (const width of [390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({width, height: 1000});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Homepage overflow at ' + width);
    await checkBrand(page, width);
  }

  for (const board of ['mo-62a', 'mo-68a']) {
    await page.goto(url + board + '/', {waitUntil: 'networkidle'});
    const cards = page.locator('.theme-doc-markdown a.card');
    assert.equal(await cards.count(), 13);
    for (const link of await cards.evaluateAll(nodes => nodes.map(n => n.href))) {
      assert.ok(link.startsWith(url + board + '/'), 'Product link must preserve the deployment prefix');
      assert.equal((await page.request.get(link)).status(), 200);
    }
    assert.equal(await sidebar.locator('a[href$="/' + board + '/"] + button').getAttribute('aria-expanded'), 'true');
    assert.equal(await sidebar.locator('a[href$="/works-with-mo/"]').count(), 1);
    await page.goto(url + board + '/getting-started/install-os/', {waitUntil: 'networkidle'});
    assert.ok((await page.locator('.theme-doc-markdown').innerText()).includes('balenaEtcher'));
    assert.ok((await page.locator('.theme-edit-this-page').getAttribute('href')).endsWith('docs/' + board + '/getting-started/install-os.mdx'));
    const firstBoot = page.locator('.theme-doc-markdown a').filter({hasText: /^First boot$/});
    assert.ok((await firstBoot.first().getAttribute('href')).startsWith(base + board + '/'));
    await page.reload({waitUntil: 'networkidle'});
    await page.goto(url + board + '/hardware-development/overview/', {waitUntil: 'networkidle'});
    assert.equal(await page.locator('.mo-spec-table').count() > 0, true);
    await page.goto(url + board + '/resource-download/', {waitUntil: 'networkidle'});
    assert.equal(await page.locator('.theme-doc-markdown a[href="' + portal + '/software#os-images"]').count(), 1);
    await page.goto(url + board + '/application-deployment/containers/', {waitUntil: 'networkidle'});
    assert.ok((await page.locator('.mo-stub').innerText()).includes('Coming soon.'));
  }

  await page.goto(url + 'mo-62a/', {waitUntil: 'networkidle'});
  await page.getByRole('button', {name: 'Search documentation', exact: true}).click();
  await page.locator('#docs-search').fill('balenaEtcher');
  await page.locator('.search-results a').first().waitFor();
  await page.locator('#search-product').selectOption('Mo 62A');
  await page.waitForFunction(() => {
    const labels = [...document.querySelectorAll('.search-results a small')];
    return labels.length > 0 && labels.every(label => label.textContent === 'Mo 62A');
  });
  const result = page.locator('.search-results a[href="' + base + 'mo-62a/getting-started/install-os/"]');
  await result.click();
  await page.waitForURL(url + 'mo-62a/getting-started/install-os/');

  await page.setViewportSize({width: 390, height: 844});
  await page.goto(url, {waitUntil: 'networkidle'});
  await page.getByRole('button', {name: 'Toggle navigation bar'}).click();
  await page.locator('.navbar-sidebar').waitFor({state: 'visible'});
  assert.ok((await page.locator('.navbar-sidebar').innerText()).includes('Mo 62A'));
  await page.getByRole('button', {name: 'Close navigation bar'}).click();
  await page.getByRole('button', {name: 'Search documentation', exact: true}).click();
  assert.equal(await page.locator('#docs-search').evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog[open]').count(), 0);
  if (process.env.QA_SCREENSHOT_DIR) {
    await fs.mkdir(process.env.QA_SCREENSHOT_DIR, {recursive: true});
    await page.screenshot({path: path.join(process.env.QA_SCREENSHOT_DIR, 'mobile.png'), fullPage: true});
    await page.setViewportSize({width: 1440, height: 1000});
    await page.goto(url, {waitUntil: 'networkidle'});
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({path: path.join(process.env.QA_SCREENSHOT_DIR, 'desktop.png'), fullPage: true});
  }
  assert.deepEqual(errors, [], 'Browser console or resource failures');
  console.log('ZYB documentation browser tests passed: ' + base + ', both boards, shared MDX, placeholders, downloads, search and mobile.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
