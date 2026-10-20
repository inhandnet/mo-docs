// Tests built HTML with a real browser. The temporary server uses an OS-assigned
// loopback port so it does not interfere with running development servers.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {checkBrand} from './brand.mjs';
import {releaseFixture} from './fixtures/release.mjs';
import {latestReleaseApi} from '../src/data/latest-image.mjs';
const base = process.env.DOCS_BASE_URL ?? '/';
const preview = process.env.DOCS_PREVIEW === '1';
const root = path.resolve(process.env.DOCS_BUILD_DIR ?? 'build');
const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.gif': 'image/gif', '.woff2': 'font/woff2'};
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
async function checkDocumentationMedia(page) {
  const images = page.locator('.theme-doc-markdown img');
  assert.ok(await images.count() > 0);
  for (const image of await images.all()) await image.evaluate(image => image.decode());
  for (const width of [390, 768, 1024, 1440, 1920, 2560]) {
    await page.setViewportSize({width, height: 1000});
    const reference = await page.locator('.theme-doc-markdown').evaluate(body => {
      const rect = (body.querySelector('.theme-admonition-note') ?? body).getBoundingClientRect();
      return {width: rect.width, left: rect.left};
    });
    const sizes = await images.evaluateAll(images => images.map(image => {
      const rect = image.getBoundingClientRect();
      return {
        width: rect.width, height: rect.height,
        left: rect.left,
        ratio: image.naturalWidth / image.naturalHeight,
      };
    }));
    for (const size of sizes) {
      assert.ok(Math.abs(size.width - reference.width) < 1, 'Documentation media must match the full body / note-box width at ' + width);
      assert.ok(Math.abs(size.left - reference.left) < 1, 'Documentation media must align with the body / note-box edge at ' + width);
      assert.ok(Math.abs(size.height - size.width / size.ratio) < 1, 'Documentation media must preserve its original proportions');
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Documentation media must not overflow at ' + width);
  }
  await page.setViewportSize({width: 1440, height: 1000});
}
let browser;
try {
  browser = await chromium.launch({headless: true});
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
  let releaseResponse = {status: 200, body: releaseFixture()};
  let releaseRequests = 0;
  await page.route(latestReleaseApi, route => {
    releaseRequests += 1;
    return route.fulfill({status: releaseResponse.status,
      contentType: 'application/json', body: JSON.stringify(releaseResponse.body)});
  });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  await page.goto(url, {waitUntil: 'networkidle'});
  assert.equal(await page.locator('h1').innerText(), 'Mo documentation');
  assert.ok((await page.locator('.theme-doc-markdown').innerText()).includes('Mo series'));
  assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), preview ? 1 : 0);
  const sidebar = page.locator('.theme-doc-sidebar-menu');
  const topLabels = await sidebar.locator(':scope > li > a, :scope > li > .menu__list-item-collapsible > a').allTextContents();
  assert.deepEqual(topLabels, ['Mo documentation', 'Mo 62A', 'Mo 68A', 'Accessories', 'Works with Mo', 'Security']);
  // Use the theme's native sidebar controls, including keyboard reopening.
  for (const width of [1024, 1440]) {
    await page.setViewportSize({width, height: 1000});
    const container = page.locator('.theme-doc-sidebar-container');
    const expandedWidth = (await container.boundingBox()).width;
    await page.getByRole('button', {name: 'Collapse sidebar', exact: true}).click();
    const expand = page.getByRole('button', {name: 'Expand sidebar', exact: true});
    await expand.waitFor({state: 'visible'});
    assert.equal(await sidebar.isVisible(), false);
    await page.waitForFunction(expected =>
      document.querySelector('.theme-doc-sidebar-container').getBoundingClientRect().width < expected / 2, expandedWidth);
    assert.ok((await container.boundingBox()).width < expandedWidth / 2, 'Collapsed sidebar must free reading space');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Collapsed layout must not overflow');
    await expand.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', {name: 'Collapse sidebar', exact: true}).waitFor({state: 'visible'});
    await page.waitForFunction(expected => {
      const rect = document.querySelector('.theme-doc-sidebar-container').getBoundingClientRect();
      return Math.abs(rect.width - expected) < 1;
    }, expandedWidth);
    assert.equal(await sidebar.isVisible(), true);
  }
  assert.equal(await page.locator('.theme-doc-markdown a.card').count(), 5);
  assert.ok((await page.locator('.theme-doc-markdown').innerText()).includes('All sections'));
  const table = page.getByRole('region', {name: 'Product specifications'});
  assert.deepEqual(await table.locator('thead th').allTextContents(), ['', 'Mo62A', 'Mo68A']);
  const acceleratorLabel = table.getByRole('cell', {name: 'AI accelerator', exact: true});
  for (const board of ['mo-62a', 'mo-68a']) assert.equal(await table.locator('a[href$="/' + board + '/getting-started/"]').count(), 1);
  const portal = (process.env.DEVELOPER_PORTAL_URL ?? 'https://www.inhand.com/developer').replace(/\/$/, '');
  assert.equal(await page.getByRole('link', {name: 'Compare the boards', exact: true}).getAttribute('href'), portal + '/hardware#compare');
  for (const width of [390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({width, height: 1000});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Homepage overflow at ' + width);
    assert.equal(await acceleratorLabel.evaluate(node => getComputedStyle(node).whiteSpace), 'nowrap');
    assert.ok(await acceleratorLabel.evaluate(node => node.scrollWidth <= node.clientWidth), 'AI accelerator must remain on one line at ' + width);
    await checkBrand(page, width);
  }

  await page.goto(url + 'mo-62a/getting-started/preparation/', {waitUntil: 'networkidle'});
  const preparation = page.locator('.mo-preparation-tables');
  assert.equal(await preparation.getByRole('heading', {name: /^Required items/}).count(), 1);
  assert.equal(await preparation.getByRole('heading', {name: /^Connection and access/}).count(), 1);
  assert.equal(await preparation.getByRole('heading', {name: /^Optional accessories/}).count(), 1);
  assert.equal(await preparation.locator('table').count(), 3);
  assert.deepEqual(await preparation.locator('thead th:nth-child(2)').allTextContents(), ['Notes', 'Notes', 'Notes']);
  assert.ok((await preparation.locator('table').nth(2).innerText()).includes('audio output and microphone input'));
  assert.deepEqual(await preparation.locator('table').nth(0).locator('tbody td:first-child').allTextContents(), [
    'USB-C power supply', 'Computer', 'microSD card', 'microSD card reader',
  ]);
  assert.ok((await preparation.locator('table').nth(0).innerText()).includes('5 V / 5 A recommended'));
  assert.ok((await preparation.locator('table').nth(0).innerText()).includes('16 GB minimum for Mo62A OS images'));
  assert.doesNotMatch(await page.locator('.theme-doc-markdown').innerText(), /12 GiB/);
  assert.deepEqual(await preparation.locator('table').nth(1).locator('tbody td:first-child').allTextContents(), [
    'Ethernet', 'Debug UART', 'Local desktop',
  ]);
  assert.equal(await preparation.locator('a[href$="/low-level-development/serial-console/"]').innerText(), 'Serial console');
  assert.doesNotMatch(await page.locator('.theme-doc-markdown').innerText(), /draws up to 25 W/);
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({width, height: 1000});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Preparation overflow at ' + width);
    const columns = await preparation.locator('thead th:first-child').evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect();
      return {left: rect.left, width: rect.width};
    }));
    for (const column of columns.slice(1)) {
      assert.ok(Math.abs(columns[0].left - column.left) < 1, 'Preparation tables must align');
      assert.ok(Math.abs(columns[0].width - column.width) < 1, 'Preparation columns must align');
    }
  }

  await page.goto(url + 'mo-68a/getting-started/preparation/', {waitUntil: 'networkidle'});
  const mo68Preparation = page.locator('.mo-preparation-tables');
  assert.equal(await mo68Preparation.locator('table').count(), 3);
  assert.deepEqual(await mo68Preparation.locator('thead th:nth-child(2)').allTextContents(), ['Notes', 'Notes', 'Notes']);
  assert.deepEqual(await mo68Preparation.locator('table').nth(0).locator('tbody td:first-child').allTextContents(), [
    'USB-C power supply', 'Computer', 'microSD card', 'microSD card reader', 'Cooling fan',
  ]);
  assert.deepEqual(await mo68Preparation.locator('table').nth(1).locator('tbody td:first-child').allTextContents(), [
    'Ethernet', 'Debug UART', 'Local desktop',
  ]);
  assert.deepEqual(await mo68Preparation.locator('table').nth(2).locator('tbody td:first-child').allTextContents(), [
    'RTC backup battery', 'CSI camera',
  ]);
  assert.ok((await mo68Preparation.locator('table').nth(1).innerText()).includes('A compatible DSI display can be used as an alternative display.'));
  assert.ok((await mo68Preparation.locator('.alert').innerText()).includes('over-temperature protection'));
  assert.ok((await mo68Preparation.locator('table').nth(1).innerText()).includes('mini DisplayPort-to-DisplayPort cable'));
  assert.doesNotMatch(await page.locator('.theme-doc-markdown').innerText(), /Wi-Fi|3\.5 mm|PCIe|16 GB|Mo62A|micro HDMI/);
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({width, height: 1000});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mo68A preparation overflow at ' + width);
    const columns = await mo68Preparation.locator('thead th:first-child').evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect();
      return {left: rect.left, width: rect.width};
    }));
    for (const column of columns.slice(1)) {
      assert.ok(Math.abs(columns[0].left - column.left) < 1, 'Mo68A preparation tables must align');
      assert.ok(Math.abs(columns[0].width - column.width) < 1, 'Mo68A preparation columns must align');
    }
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
    const requestsBeforeInstall = releaseRequests;
    await page.goto(url + board + '/getting-started/install-os/', {waitUntil: 'networkidle'});
    assert.equal(await page.getByRole('heading', {name: '2. Write the image with Armbian Imager'}).count(), 1);
    assert.equal(await page.locator('.theme-doc-markdown').getByRole('link', {name: 'Armbian Imager', exact: true}).getAttribute('href'), 'https://imager.armbian.com/');
    const etcherLink = page.locator('.theme-doc-markdown').getByRole('link', {name: 'balenaEtcher', exact: true});
    assert.equal(await etcherLink.getAttribute('href'), 'https://etcher.balena.io/');
    assert.equal(await etcherLink.evaluate(link => link.closest('p').textContent), 'The steps below use Armbian Imager. Other image writers, such as balenaEtcher, also work.');
    assert.deepEqual(await etcherLink.evaluate(link => {
      const paragraph = link.closest('p');
      return [paragraph.previousElementSibling?.tagName, paragraph.previousElementSibling?.textContent.replace(/\u200b/g, ''), paragraph.nextElementSibling?.tagName];
    }), ['H2', '2. Write the image with Armbian Imager', 'OL']);
    assert.ok((await page.locator('.theme-doc-markdown').innerText()).includes('choose the version for your operating system: Windows, macOS or Linux'));
    const imagerScreenshot = page.getByRole('img', {name: 'Downloading and installing Armbian Imager on Windows', exact: true});
    assert.equal(await imagerScreenshot.count(), 1);
    await imagerScreenshot.scrollIntoViewIfNeeded();
    await imagerScreenshot.evaluate(image => image.decode());
    assert.ok((await imagerScreenshot.getAttribute('src')).endsWith('.gif'));
    assert.equal(await imagerScreenshot.evaluate(image => Array.from(image.closest('ol').children).indexOf(image.closest('li'))), 0);
    assert.ok(await imagerScreenshot.evaluate(image => image.complete && image.naturalWidth > 0));
    assert.equal(await imagerScreenshot.evaluate(image => image.closest('li')?.querySelector('a')?.textContent), 'Armbian Imager');
    const customImageScreenshot = page.getByRole('img', {name: board === 'mo-62a'
      ? 'Armbian Imager: click Use Custom Image, select the Mo62A OS image, and click Open'
      : 'Armbian Imager on Windows showing the Use Custom Image button', exact: true});
    await customImageScreenshot.scrollIntoViewIfNeeded();
    await customImageScreenshot.evaluate(image => image.decode());
    assert.ok(await customImageScreenshot.evaluate(image => image.naturalWidth > 0));
    assert.equal(await customImageScreenshot.evaluate(image => image.closest('li')?.querySelector('strong')?.textContent), 'Use Custom Image');
    assert.equal(await customImageScreenshot.evaluate(image => Array.from(image.closest('ol').children).indexOf(image.closest('li'))), 1);
    assert.ok((await customImageScreenshot.getAttribute('src')).endsWith(board === 'mo-62a' ? '.gif' : '.png'), 'The Mo62A image-selection recording must not appear on Mo68A');
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.waitForFunction(() => [...document.querySelectorAll('.mo-tool-screenshot picture img')].every(image => image.currentSrc.endsWith('.png')));
    await imagerScreenshot.evaluate(image => image.decode());
    assert.ok(await imagerScreenshot.evaluate(image => image.naturalWidth > 0));
    await customImageScreenshot.evaluate(image => image.decode());
    assert.ok(await customImageScreenshot.evaluate(image => image.naturalWidth > 0));
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.waitForFunction(() => [...document.querySelectorAll('.mo-tool-screenshot picture img')].every(image => image.currentSrc === image.src));
    for (const screenshot of [imagerScreenshot, customImageScreenshot]) {
      assert.equal(await screenshot.evaluate(image => getComputedStyle(image).clipPath), 'inset(2px round 8px)');
    }
    const sdCardAnimation = page.getByRole('img', {name: 'Armbian Imager: select the microSD card and review Confirm Selection', exact: true});
    assert.equal(await sdCardAnimation.count(), board === 'mo-62a' ? 1 : 0, 'The recording with a Mo62A image name must appear only on Mo62A');
    if (board === 'mo-62a') {
      await sdCardAnimation.evaluate(image => image.decode());
      assert.ok(await sdCardAnimation.evaluate(image => image.currentSrc.endsWith('.gif') && image.naturalWidth > 0));
      assert.equal(await sdCardAnimation.evaluate(image => Array.from(image.closest('ol').children).indexOf(image.closest('li'))), 2);
      assert.equal(await sdCardAnimation.evaluate(image => image.closest('li').querySelector('strong').textContent), 'Storage');
      assert.ok((await sdCardAnimation.evaluate(image => image.closest('li').textContent)).includes('device name and capacity'));
      assert.ok((await sdCardAnimation.evaluate(image => image.closest('li').textContent)).trimStart().startsWith('Insert the microSD card into a card reader and connect the reader to your computer.'));
      assert.equal(await sdCardAnimation.evaluate(image => getComputedStyle(image).clipPath), 'inset(2px round 8px)');
    }
    await checkDocumentationMedia(page);
    if (board === 'mo-62a') {
      const writingAnimation = page.getByRole('img', {name: 'Armbian Imager: write and verify the microSD card, then click Done', exact: true});
      assert.equal(await writingAnimation.count(), 1);
      await writingAnimation.evaluate(image => image.decode());
      assert.ok(await writingAnimation.evaluate(image => image.currentSrc.endsWith('.gif') && image.naturalWidth > 0));
      assert.equal(await writingAnimation.evaluate(image => Array.from(image.closest('ol').children).indexOf(image.closest('li'))), 3);
      const writingStep = await writingAnimation.evaluate(image => image.closest('li').textContent);
      for (const text of ['Erase & Flash', 'written and verified', 'Flash complete!', 'Done']) assert.ok(writingStep.includes(text));
      assert.ok(!writingStep.includes('The recording is sped up.'));
      assert.equal(await writingAnimation.evaluate(image => getComputedStyle(image).clipPath), 'inset(2px round 8px)');
      const download = page.locator('.mo-image-download');
      await download.getByRole('link', {name: 'latest Mo62A OS image', exact: true}).waitFor();
      assert.equal(await download.getByRole('link', {name: 'latest Mo62A OS image', exact: true}).getAttribute('href'), releaseFixture().assets[0].browser_download_url);
      const checksumLink = page.getByRole('link', {name: 'SHA256SUMS', exact: true});
      assert.equal(await checksumLink.getAttribute('href'), releaseFixture().assets[1].browser_download_url);
      assert.equal(await page.locator('.alert').filter({has: checksumLink}).count(), 1, 'Checksum download must appear in a note');
      assert.equal(releaseRequests - requestsBeforeInstall, 1, 'Image and checksums must share one release lookup');
      assert.equal(await page.getByRole('link', {name: 'view all releases', exact: true}).getAttribute('href'), 'https://github.com/inhandnet/Mo62A/releases');
      assert.equal(await download.locator('button, svg').count(), 0);
      assert.equal(await download.evaluate(node => node.parentElement.tagName), 'P');
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({width, height: 1000});
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Image download layout overflow at ' + width);
      }
      for (const status of [404, 403]) {
        releaseResponse = {status, body: {message: 'Unavailable'}};
        await page.reload({waitUntil: 'networkidle'});
        await page.waitForFunction(() => !document.querySelector('.mo-image-status')?.textContent.includes('Checking'));
        assert.equal(await download.locator('a').count(), 0);
        assert.equal(await download.locator('[aria-disabled="true"]').innerText(), 'latest Mo62A OS image');
        assert.equal(await page.locator('.mo-checksums-download a').count(), 0);
        assert.equal(await page.locator('.mo-checksums-download [aria-disabled="true"]').innerText(), 'SHA256SUMS');
        assert.equal(await page.getByRole('link', {name: 'view all releases', exact: true}).getAttribute('href'), 'https://github.com/inhandnet/Mo62A/releases');
      }
      releaseResponse = {status: 200, body: releaseFixture()};
      await page.reload({waitUntil: 'networkidle'});
    } else {
      assert.equal(await page.locator('.mo-image-download').count(), 0);
      assert.equal(await page.getByRole('img', {name: 'Armbian Imager: write and verify the microSD card, then click Done', exact: true}).count(), 0);
    }
    assert.ok((await page.locator('.theme-edit-this-page').getAttribute('href')).endsWith('docs/' + board + '/getting-started/install-os.mdx'));
    assert.ok((await page.locator('.theme-edit-this-page').getAttribute('href')).includes('/edit/master/'));
    const firstBoot = page.locator('.theme-doc-markdown a').filter({hasText: /^First boot$/});
    assert.ok((await firstBoot.first().getAttribute('href')).startsWith(base + board + '/'));
    assert.equal(await page.getByRole('heading', {name: /^3\. Pre-configure the board \(Optional\)/}).count(), 1);
    const preconfigure = page.locator('.mo-preconfigure');
    assert.equal(await preconfigure.count(), board === 'mo-62a' ? 1 : 0);
    if (board === 'mo-62a') {
      assert.equal(await preconfigure.locator('ol > li').count(), 3);
      assert.equal(await preconfigure.locator('pre').count(), 2);
      assert.equal(await preconfigure.locator('img').count(), 2);
      const bootScreenshot = preconfigure.getByRole('img', {name: 'Windows File Explorer showing sysconfig.txt selected on the BOOT drive', exact: true});
      await bootScreenshot.evaluate(image => image.decode());
      assert.ok(await bootScreenshot.evaluate(image => image.naturalWidth > 0));
      assert.equal(await bootScreenshot.evaluate(image => Array.from(image.closest('ol').children).indexOf(image.closest('li'))), 0);
      const configScreenshot = preconfigure.getByRole('img', {name: 'Original Mo62A sysconfig.txt showing the default login and commented-out optional settings', exact: true});
      await configScreenshot.evaluate(image => image.decode());
      assert.ok(await configScreenshot.evaluate(image => image.naturalWidth > 0));
      assert.equal(await configScreenshot.evaluate(image => Array.from(image.closest('ol').children).indexOf(image.closest('li'))), 1);
      assert.ok((await configScreenshot.evaluate(image => image.closest('li').textContent)).includes('original file before any changes'));
      assert.ok((await preconfigure.locator('.theme-admonition-note').innerText()).includes('changing the default username and password before the first boot'));
      const configurationText = await preconfigure.innerText();
      for (const expected of ['user_name=alice', 'user_password=replace-with-your-own-strong-password', 'hostname=mo62a-lab', 'wifi_ssid=YourNetworkName', 'wifi_password=YourWiFiPassword', 'wifi_country=US', 'Ethernet with DHCP', 'not read on subsequent boots', 'does not confirm that every setting was applied successfully']) {
        assert.ok(configurationText.includes(expected), 'Missing pre-configuration guidance: ' + expected);
      }
      const reference = preconfigure.getByRole('link', {name: 'sysconfig.txt reference', exact: true});
      const referenceHref = await reference.getAttribute('href');
      assert.equal(referenceHref, base + 'mo-62a/system-configuration/sysconfig-reference/');
      assert.equal((await page.request.get(origin + referenceHref)).status(), 200);
      for (const width of [390, 768, 1440, 1920]) {
        await page.setViewportSize({width, height: 1000});
        const alignment = await preconfigure.evaluate(section => {
          const body = section.getBoundingClientRect();
          const blocks = [...section.querySelectorAll(':scope > p, :scope > ol > li, :scope > ol > li > p:not(:first-child), .mo-tool-screenshot, .theme-code-block')];
          return blocks.map(block => {
            const rect = block.getBoundingClientRect();
            return {left: rect.left - body.left, width: rect.width - body.width};
          });
        });
        for (const block of alignment) {
          assert.ok(Math.abs(block.left) < 1 && Math.abs(block.width) < 1, 'Pre-configuration text, screenshots and code must share the body edges at ' + width);
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Pre-configuration must not overflow at ' + width);
      }
      await page.setViewportSize({width: 1440, height: 1000});
    }
    await page.reload({waitUntil: 'networkidle'});
    if (board === 'mo-62a') {
      await page.goto(url + board + '/getting-started/first-boot/', {waitUntil: 'networkidle'});
      const firstBootBody = page.locator('.theme-doc-markdown');
      assert.deepEqual(await firstBootBody.locator('h2').allTextContents().then(headings => headings.map(heading => heading.replace(/\u200b/g, ''))), [
        '1. Connect the board', '2. Power on and wait', '3. Log in', '4. Check your setup',
      ]);
      for (const heading of ['SSH', 'Local desktop', 'Serial console']) {
        assert.equal(await firstBootBody.getByRole('heading', {name: new RegExp('^' + heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))}).count(), 1);
      }
      assert.equal(await firstBootBody.locator('img').count(), 6);
      for (const [file, heading, width, height] of [
        ['mo62a-first-boot-ssh', 'SSH', 1439, 899],
        ['mo62a-first-boot-desktop-login', 'Local desktop', 1920, 1080],
        ['mo62a-first-boot-desktop', 'Local desktop', 1920, 1080],
        ['mo62a-first-boot-uart', 'Serial console', 1439, 899],
        ['mo62a-first-boot-storage', '4. Check your setup', 1439, 899],
      ]) {
        const screenshot = firstBootBody.locator(`img[src*="${file}"]:not([src*="${file}-login"])`);
        assert.equal(await screenshot.count(), 1);
        await screenshot.evaluate(image => image.decode());
        assert.deepEqual(await screenshot.evaluate(image => [image.naturalWidth, image.naturalHeight]), [width, height]);
        assert.ok(await screenshot.getAttribute('alt'));
        assert.equal(await screenshot.locator('..').getAttribute('href'), await screenshot.getAttribute('src'));
        assert.equal(await screenshot.locator('..').getAttribute('target'), '_blank');
        assert.equal(await screenshot.evaluate(image =>
          [...document.querySelectorAll('.theme-doc-markdown h2, .theme-doc-markdown h3')]
            .filter(heading => heading.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING)
            .at(-1)?.textContent.replace(/\u200b/g, '')), heading);
      }
      const connectAnimation = firstBootBody.locator('.mo-first-boot-animation img');
      assert.equal(await connectAnimation.count(), 1);
      await connectAnimation.evaluate(image => image.decode());
      assert.match(await connectAnimation.getAttribute('src'), /mo62a-connect-board.*\.gif$/);
      assert.equal(await connectAnimation.evaluate(image => image.currentSrc === image.src), true);
      assert.equal(await connectAnimation.evaluate(image => image.naturalWidth), 2162);
      assert.equal(await connectAnimation.evaluate(image => image.naturalHeight), 1416);
      assert.equal(await connectAnimation.evaluate(image =>
        [...document.querySelectorAll('.theme-doc-markdown h2')]
          .filter(heading => heading.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING)
          .at(-1)?.id), '1-connect-the-board');
      await checkDocumentationMedia(page);
      await page.emulateMedia({reducedMotion: 'reduce'});
      await page.waitForFunction(() => document.querySelector('.mo-first-boot-animation img').currentSrc.endsWith('.png'));
      await connectAnimation.evaluate(image => image.decode());
      await checkDocumentationMedia(page);
      await page.emulateMedia({reducedMotion: 'no-preference'});
      await page.waitForFunction(() => {
        const image = document.querySelector('.mo-first-boot-animation img');
        return image.currentSrc === image.src;
      });
      const firstBootText = await firstBootBody.innerText();
      assert.ok(firstBootText.includes('Use the accessories for your chosen method, and connect USB-C power last.'));
      assert.doesNotMatch(firstBootText, /reboots automatically|30–45|1–2 extra|user_name=alice|temppwd|desktop starts automatically/);
      for (const expected of ['You do not need all three', 'micro HDMI-to-HDMI', 'ssh YOUR_USERNAME@BOARD_IP_ADDRESS', 'passwd', 'whoami', 'ip -br address', 'df -h /', 'Network', '/var/log/mo-62a-firstboot-install.log']) {
        assert.ok(firstBootText.includes(expected), 'Missing first-boot guidance: ' + expected);
      }
      assert.doesNotMatch(firstBootText, /Connect to Wi-Fi after login|nmcli/);
      const networkLinks = firstBootBody.getByRole('link', {name: 'Network', exact: true});
      assert.ok(await networkLinks.count() >= 1);
      for (const link of await networkLinks.all()) assert.equal(await link.getAttribute('href'), base + board + '/mo-os/network/');
      const accessTable = firstBootBody.locator('.mo-first-boot-access-table table');
      assert.equal(await accessTable.count(), 1);
      assert.deepEqual(await accessTable.locator('tr > :first-child').allTextContents(), [
        'Access method', 'Ethernet / SSH', 'Local desktop', 'Serial console',
      ]);
      const preconfigureLink = firstBootBody.getByRole('link', {name: 'Pre-configure the board', exact: true});
      const preconfigureHref = await preconfigureLink.getAttribute('href');
      assert.equal(preconfigureHref, base + board + '/getting-started/install-os/#3-pre-configure-the-board-optional');
      const internalLinks = await firstBootBody.locator('a[href]').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')).filter(href => href.startsWith('/') && !href.startsWith('//')))]);
      for (const href of internalLinks) assert.equal((await page.request.get(origin + href)).status(), 200, 'First boot link must resolve: ' + href);
      for (const width of [390, 768, 1440, 1920]) {
        await page.setViewportSize({width, height: 1000});
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'First boot must not overflow at ' + width);
        for (const cell of await accessTable.locator('tr > :first-child').all()) {
          assert.equal(await cell.evaluate(node => getComputedStyle(node).whiteSpace), 'nowrap');
          assert.ok(await cell.evaluate(node => node.scrollWidth <= node.clientWidth), 'First-boot access method must remain on one line at ' + width);
        }
        const edges = await firstBootBody.evaluate(body => {
          const rect = body.getBoundingClientRect();
          return [...body.querySelectorAll(':scope > p, :scope > .theme-code-block')].map(node => {
            const block = node.getBoundingClientRect();
            return {left: block.left - rect.left, width: block.width - rect.width};
          });
        });
        for (const edge of edges) assert.ok(Math.abs(edge.left) < 1 && Math.abs(edge.width) < 1, 'First boot paragraphs and code must share body edges');
      }
      await page.setViewportSize({width: 1440, height: 1000});
      await preconfigureLink.click();
      await page.waitForURL(url + board + '/getting-started/install-os/#3-pre-configure-the-board-optional');
      await page.locator('[id="3-pre-configure-the-board-optional"]').waitFor();
      assert.equal(await page.locator('[id="3-pre-configure-the-board-optional"]').count(), 1);

      await page.goto(url + board + '/mo-os/using-mo-os/', {waitUntil: 'networkidle'});
      const usingMoOsBody = page.locator('.theme-doc-markdown');
      assert.deepEqual(await usingMoOsBody.locator('h2').allTextContents().then(items => items.map(item => item.replace(/\u200b/g, ''))), [
        'Use the XFCE desktop',
        'Identify the software and resources',
        'Work with files and storage',
        'Run administrative commands',
        'Install Debian packages',
        'Manage services and read logs',
        'Set time, time zone and synchronization',
        'Restart and shut down safely',
        'Troubleshooting',
        'Continue with Mo OS',
      ]);
      assert.equal(await usingMoOsBody.locator('img').count(), 5);
      for (const [file, width, height] of [
        ['mo62a-desktop-applications', 1920, 1080],
        ['mo62a-system', 1440, 900],
        ['mo62a-services', 1439, 899],
        ['mo62a-apt-install', 1440, 900],
        ['mo62a-desktop-shutdown', 1920, 1080],
      ]) {
        const screenshot = usingMoOsBody.locator(`img[src*="${file}"]`);
        assert.equal(await screenshot.count(), 1);
        await screenshot.evaluate(image => image.decode());
        assert.deepEqual(await screenshot.evaluate(image => [image.naturalWidth, image.naturalHeight]), [width, height]);
        assert.ok(await screenshot.getAttribute('alt'));
        assert.equal(await screenshot.evaluate(image => image.closest('a')?.href), await screenshot.evaluate(image => image.src));
        assert.equal(await screenshot.evaluate(image => image.closest('a')?.target), '_blank');
      }
      const aptAnimation = usingMoOsBody.locator('picture img[src*="mo62a-apt-install"]');
      assert.equal(await aptAnimation.count(), 1);
      assert.ok((await aptAnimation.getAttribute('src')).endsWith('.gif'));
      await page.emulateMedia({reducedMotion: 'reduce'});
      await page.waitForFunction(() => document.querySelector('.theme-doc-markdown picture img').currentSrc.endsWith('.png'));
      await aptAnimation.evaluate(image => image.decode());
      assert.deepEqual(await aptAnimation.evaluate(image => [image.naturalWidth, image.naturalHeight]), [1440, 900]);
      await page.emulateMedia({reducedMotion: 'no-preference'});
      await page.waitForFunction(() => {
        const image = document.querySelector('.theme-doc-markdown picture img');
        return image.currentSrc === image.src;
      });
      const usingMoOsText = await usingMoOsBody.innerText();
      for (const expected of [
        'Mo62A image V1.1.0',
        'mo-version',
        'sudo apt upgrade --dry-run',
        'APT can update standard Debian user-space packages',
        'systemctl --failed --no-pager',
        'timedatectl set-timezone Region/City',
        'Use a forced power-off only when the system is unresponsive',
      ]) assert.ok(usingMoOsText.includes(expected), 'Missing Using Mo OS guidance: ' + expected);
      assert.ok(!usingMoOsText.includes('sudo apt update && sudo apt upgrade'));
      await checkDocumentationMedia(page);
      const usingMoOsHrefs = await usingMoOsBody.locator('a[href]').evaluateAll(links =>
        [...new Set(links.map(link => link.getAttribute('href')).filter(href => href.startsWith('/') && !href.startsWith('//')))]);
      for (const href of usingMoOsHrefs) assert.equal((await page.request.get(origin + href)).status(), 200, 'Using Mo OS link must resolve: ' + href);

      await page.goto(url + board + '/mo-os/display-and-audio/', {waitUntil: 'networkidle'});
      const displayAudioBody = page.locator('.theme-doc-markdown');
      assert.deepEqual(await displayAudioBody.locator('h2').allTextContents().then(items => items.map(item => item.replace(/\u200b/g, ''))), [
        'Connect a display',
        'Configure the display from XFCE',
        'Inspect or set a mode from the terminal',
        'Screen blanking and wake-up',
        'Choose an audio output',
        'Configure the headset microphone',
        'Manage audio from the terminal',
        'Troubleshooting',
      ]);
      assert.equal(await displayAudioBody.locator('img').count(), 5);
      for (const [file, width, height] of [
        ['mo62a-display-settings', 1920, 1080],
        ['mo62a-display-terminal', 1440, 900],
        ['mo62a-audio-output', 1920, 1080],
        ['mo62a-audio-input', 1920, 1080],
        ['mo62a-audio-terminal', 1440, 900],
      ]) {
        const screenshot = displayAudioBody.locator(`img[src*="${file}"]`);
        assert.equal(await screenshot.count(), 1);
        await screenshot.evaluate(image => image.decode());
        assert.deepEqual(await screenshot.evaluate(image => [image.naturalWidth, image.naturalHeight]), [width, height]);
        assert.ok(await screenshot.getAttribute('alt'));
        assert.equal(await screenshot.evaluate(image => image.closest('a')?.href), await screenshot.evaluate(image => image.src));
        assert.equal(await screenshot.evaluate(image => image.closest('a')?.target), '_blank');
      }
      const displayAudioText = await displayAudioBody.innerText();
      for (const expected of [
        'Mo62A image V1.1.0',
        'xrandr --current',
        'DPMS is Enabled',
        '600 seconds (10 minutes)',
        'Mo62A Headset Output',
        'Mo62A HDMI Output',
        'Mo62A Headset Microphone',
        'pw-record',
      ]) assert.ok(displayAudioText.includes(expected), 'Missing Display & audio guidance: ' + expected);
      assert.ok(!displayAudioText.includes('DPMS) is disabled by default'));
      for (const width of [390, 768, 1440, 1920, 2560]) {
        await page.setViewportSize({width, height: 1000});
        await checkDocumentationMedia(page);
      }
      await page.setViewportSize({width: 1440, height: 1000});
      const displayAudioHrefs = await displayAudioBody.locator('a[href]').evaluateAll(links =>
        [...new Set(links.map(link => link.getAttribute('href')).filter(href => href.startsWith('/') && !href.startsWith('//')))]);
      for (const href of displayAudioHrefs) assert.equal((await page.request.get(origin + href)).status(), 200, 'Display & audio link must resolve: ' + href);

      await page.goto(url + board + '/mo-os/remote-access/', {waitUntil: 'networkidle'});
      const remoteBody = page.locator('.theme-doc-markdown');
      assert.deepEqual(await remoteBody.locator('h2').allTextContents().then(items => items.map(item => item.replace(/\u200b/g, ''))), [
        'Choose a method',
        'Log in with SSH',
        'Use SSH keys',
        'Transfer files',
        'Use the desktop with VNC',
        'Run one graphical application',
        'Access from outside your local network',
        'Troubleshooting',
        'Continue with Mo OS',
      ]);
      assert.equal(await remoteBody.locator('img').count(), 6);
      for (const [file, width, height] of [
        ['mo62a-ssh-login', 1440, 900],
        ['mo62a-ssh-keys', 1440, 900],
        ['mo62a-file-transfer', 1440, 900],
        ['mo62a-vnc-password', 1200, 316],
        ['mo62a-vnc-desktop', 1920, 1080],
        ['mo62a-x11-forwarding', 1920, 1080],
      ]) {
        const screenshot = remoteBody.locator(`img[src*="${file}"]`);
        assert.equal(await screenshot.count(), 1);
        await screenshot.evaluate(image => image.decode());
        assert.deepEqual(await screenshot.evaluate(image => [image.naturalWidth, image.naturalHeight]), [width, height]);
        assert.ok(await screenshot.getAttribute('alt'));
        assert.equal(await screenshot.evaluate(image => image.closest('a')?.target), '_blank');
      }
      assert.equal(await remoteBody.locator('picture source[media="(prefers-reduced-motion: reduce)"]').count(), 3);
      const remoteText = await remoteBody.innerText();
      for (const expected of [
        'Mo62A image V1.1.0',
        'ssh alice@BOARD_HOSTNAME.local',
        'ssh-copy-id alice@BOARD_HOSTNAME.local',
        'rsync -av --progress',
        'x11vnc -display :0 -auth guess -localhost',
        'ssh -N -L 5900:localhost:5900 mo62a',
        'ssh -X mo62a mousepad',
        'Do not forward port 22 or 5900',
      ]) assert.ok(remoteText.includes(expected), 'Missing Remote access guidance: ' + expected);
      assert.ok(!/10\.5\.\d+\.\d+/.test(remoteText));
      for (const width of [390, 768, 1440, 1920, 2560]) {
        await page.setViewportSize({width, height: 1000});
        await checkDocumentationMedia(page);
      }
      await page.setViewportSize({width: 1440, height: 1000});
      const remoteHrefs = await remoteBody.locator('a[href]').evaluateAll(links =>
        [...new Set(links.map(link => link.getAttribute('href')).filter(href => href.startsWith('/') && !href.startsWith('//')))]);
      for (const href of remoteHrefs) assert.equal((await page.request.get(origin + href)).status(), 200, 'Remote access link must resolve: ' + href);

      await page.goto(url + board + '/mo-os/users-and-security/', {waitUntil: 'networkidle'});
      const securityBody = page.locator('.theme-doc-markdown');
      assert.deepEqual(await securityBody.locator('h2').allTextContents().then(items => items.map(item => item.replace(/\u200b/g, ''))), [
        'Accounts created at first boot',
        'Change your password',
        'Add users and grant permissions',
        'Require a password for sudo',
        'Harden the SSH server',
        'Enable a firewall',
        'Keep the system updated',
        'Troubleshooting',
        'Related pages',
      ]);
      assert.equal(await securityBody.locator('img').count(), 4);
      for (const file of ['mo62a-change-password', 'mo62a-add-user', 'mo62a-sshd-hardening', 'mo62a-nftables']) {
        const screenshot = securityBody.locator(`img[src*="${file}"]`);
        assert.equal(await screenshot.count(), 1);
        await screenshot.evaluate(image => image.decode());
        assert.deepEqual(await screenshot.evaluate(image => [image.naturalWidth, image.naturalHeight]), [1440, 900]);
        assert.ok(await screenshot.getAttribute('alt'));
        assert.equal(await screenshot.evaluate(image => image.closest('a')?.target), '_blank');
      }
      const securityText = await securityBody.innerText();
      for (const expected of [
        'Mo62A image V1.1.0',
        'without entering a password',
        'passwd -S',
        'sudo usermod -aG sudo,dialout,video,render bob',
        'sudo rm /etc/sudoers.d/010-USERNAME-nopasswd',
        'PasswordAuthentication no',
        'sudo sshd -t',
        'udp dport 5353 accept',
        'sudo systemctl enable --now nftables',
      ]) assert.ok(securityText.includes(expected), 'Missing Users & security guidance: ' + expected);
      assert.ok(!securityText.includes('sudo ufw enable'));
      assert.ok(!/10\.5\.\d+\.\d+/.test(securityText));
      for (const width of [390, 768, 1440, 1920, 2560]) {
        await page.setViewportSize({width, height: 1000});
        await checkDocumentationMedia(page);
      }
      await page.setViewportSize({width: 1440, height: 1000});
      const securityHrefs = await securityBody.locator('a[href]').evaluateAll(links =>
        [...new Set(links.map(link => link.getAttribute('href')).filter(href => href.startsWith('/') && !href.startsWith('//')))]);
      for (const href of securityHrefs) assert.equal((await page.request.get(origin + href)).status(), 200, 'Users & security link must resolve: ' + href);

      for (const [slug, headings, images, phrases] of [
        ['storage-and-boot', ['Boot sequence', 'Partition layout', 'What the first boot changes', 'Boot entries', 'Back up and clone the card', 'Troubleshooting', 'Related pages'],
          ['mo62a-storage', 'mo62a-bootcfg-switch'], ['/dev/mmcblk1p3', '255 MiB', 'sudo bootcfg switch LABEL', 'extlinux.conf.bak']],
        ['device-tree-overlays', ['Boot entries and overlays', 'Select an entry', 'Add your own entry', 'Build a custom overlay', 'Troubleshooting', 'Related pages'],
          ['mo62a-bootcfg-verify'], ['microSD-uart5', 'k3-am62a7-mo-62a-exp-periph.dtbo', 'serial@2850000', 'fdtoverlays']],
        ['sysconfig-reference', ['File format', 'Settings', 'Example', 'Check what was applied', 'Troubleshooting', 'Related pages'],
          [], ['user_ssh_key', 'static_gateway', 'wifi_country', 'sysconfig.txt removed']],
      ]) {
        await page.goto(url + board + '/system-configuration/' + slug + '/', {waitUntil: 'networkidle'});
        const body = page.locator('.theme-doc-markdown');
        assert.deepEqual(await body.locator('h2').allTextContents().then(items => items.map(item => item.replace(/\u200b/g, ''))), headings, slug + ' headings');
        assert.equal(await body.locator('img').count(), images.length, slug + ' image count');
        for (const file of images) {
          const screenshot = body.locator(`img[src*="${file}"]`);
          assert.equal(await screenshot.count(), 1);
          await screenshot.evaluate(image => image.decode());
          assert.deepEqual(await screenshot.evaluate(image => [image.naturalWidth, image.naturalHeight]), [1440, 900]);
          assert.ok(await screenshot.getAttribute('alt'));
          assert.equal(await screenshot.evaluate(image => image.closest('a')?.target), '_blank');
        }
        const text = await body.innerText();
        for (const phrase of phrases) assert.ok(text.includes(phrase), 'Missing ' + slug + ' guidance: ' + phrase);
        assert.ok(!/10\.5\.\d+\.\d+/.test(text));
        assert.ok(!text.includes('Coming soon'), slug + ' must not be a placeholder');
        for (const width of [390, 768, 1440, 1920, 2560]) {
          await page.setViewportSize({width, height: 1000});
          if (images.length) await checkDocumentationMedia(page);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), slug + ' must not overflow at ' + width);
        }
        await page.setViewportSize({width: 1440, height: 1000});
        const hrefs = await body.locator('a[href]').evaluateAll(links =>
          [...new Set(links.map(link => link.getAttribute('href')).filter(href => href.startsWith('/') && !href.startsWith('//')))]);
        for (const href of hrefs) assert.equal((await page.request.get(origin + href)).status(), 200, slug + ' link must resolve: ' + href);
      }

      await page.goto(url + board + '/mo-os/network/', {waitUntil: 'networkidle'});
      const networkBody = page.locator('.theme-doc-markdown');
      assert.deepEqual(await networkBody.locator('h2').allTextContents().then(items => items.map(item => item.replace(/\u200b/g, ''))), [
        'Ethernet', 'Shared Wi-Fi and BLE antenna', 'Wi-Fi', 'Bluetooth Low Energy (BLE)', 'Troubleshooting',
      ]);
      assert.equal(await networkBody.getByRole('heading', {name: /^Command line/}).count(), 3);
      assert.equal(await networkBody.getByRole('heading', {name: /^Desktop/}).count(), 3);
      assert.equal(await networkBody.locator('img').count(), 13);
      for (const [part, section] of [['ethernet', 'ethernet'], ['wifi', 'wi-fi'], ['ble', 'bluetooth-low-energy-ble']]) {
        const screenshots = networkBody.locator(`img[src*="mo62a-network-${part}-"]`);
        assert.equal(await screenshots.count(), 4);
        for (const screenshot of await screenshots.all()) {
          await screenshot.evaluate(image => image.decode());
          const terminal = (await screenshot.getAttribute('src')).includes('-terminal');
          assert.deepEqual(await screenshot.evaluate(image => [image.naturalWidth, image.naturalHeight]), terminal ? [1439, 899] : [1920, 1080]);
          assert.equal(await screenshot.locator('..').getAttribute('href'), await screenshot.getAttribute('src'));
          assert.equal(await screenshot.evaluate(image => [...document.querySelectorAll('.theme-doc-markdown h2')]
            .filter(heading => heading.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING).at(-1)?.id), section);
        }
      }
      const antenna = networkBody.locator('picture img');
      assert.equal(await antenna.count(), 1);
      await antenna.evaluate(image => image.decode());
      assert.deepEqual(await antenna.evaluate(image => [image.naturalWidth, image.naturalHeight]), [2900, 1416]);
      await checkDocumentationMedia(page);
      await page.emulateMedia({reducedMotion: 'reduce'});
      await page.waitForFunction(() => document.querySelector('.theme-doc-markdown picture img').currentSrc.endsWith('.png'));
      await antenna.evaluate(image => image.decode());
      await page.emulateMedia({reducedMotion: 'no-preference'});
      for (const link of await networkBody.locator('a[download]').all()) {
        const href = await link.getAttribute('href');
        assert.ok(href.startsWith(base + 'downloads/network/'));
        const response = await page.request.get(origin + href);
        assert.equal(response.status(), 200);
        assert.ok((await response.text()).startsWith('#!/usr/bin/env python3'));
      }
      assert.equal(await networkBody.locator('a[download]').count(), 2);
      assert.equal(await networkBody.getByRole('link', {name: 'shared CON1 antenna', exact: true}).count(), 0);
      const networkHrefs = await networkBody.locator('a[href]').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')).filter(href => href.startsWith('/') && !href.startsWith('//')))]);
      for (const href of networkHrefs) assert.equal((await page.request.get(origin + href)).status(), 200, 'Network link must resolve: ' + href);
    }
    await page.goto(url + board + '/hardware-development/overview/', {waitUntil: 'networkidle'});
    assert.equal(await page.locator('.mo-spec-table').count() > 0, true);
    await checkDocumentationMedia(page);
    await page.goto(url + board + '/resource-download/', {waitUntil: 'networkidle'});
    assert.equal(await page.locator('.theme-doc-markdown a[href="' + portal + '/software#os-images"]').count(), 1);
    await page.goto(url + board + '/application-deployment/containers/', {waitUntil: 'networkidle'});
    assert.ok((await page.locator('.mo-stub').innerText()).includes('Coming soon.'));
    assert.doesNotMatch(await page.locator('.mo-stub').innerText(), /\bP[0-3]\b|Existing material/);
  }

  await page.goto(url + 'mo-62a/', {waitUntil: 'networkidle'});
  await page.getByRole('button', {name: 'Search documentation', exact: true}).click();
  await page.locator('#docs-search').fill('Armbian Imager');
  await page.locator('.search-results a').first().waitFor();
  await page.locator('#search-product').selectOption('Mo 62A');
  await page.waitForFunction(() => {
    const labels = [...document.querySelectorAll('.search-results a small')];
    return labels.length > 0 && labels.every(label => label.textContent === 'Mo 62A');
  });
  const result = page.locator('.search-results a[href="' + base + 'mo-62a/getting-started/install-os/"]');
  await result.click();
  await page.waitForURL(url + 'mo-62a/getting-started/install-os/');

  // Keep scene switching and next-step destinations working under every base URL.
  await page.goto(url + 'mo-62a/getting-started/first-npu-demo/', {waitUntil: 'networkidle'});
  for (const name of ['Road / C++', 'Road / Python', 'People / C++', 'Pet / C++']) {
    await page.getByRole('tab', {name, exact: true}).click();
    const video = page.locator('.theme-doc-markdown video');
    assert.equal(await video.count(), 1, 'Inactive scene videos must be unmounted');
    assert.equal(await video.getAttribute('autoplay'), null);
    for (const asset of [await video.getAttribute('poster'), await video.locator('source').getAttribute('src')]) {
      assert.ok(asset.startsWith(base));
      assert.equal((await page.request.get(origin + asset)).status(), 200);
    }
    for (const width of [390, 1440]) {
      await page.setViewportSize({width, height: 1000});
      const body = await page.locator('.theme-doc-markdown').boundingBox();
      const media = await video.boundingBox();
      assert.ok(Math.abs(body.x - media.x) < 1 && Math.abs(body.width - media.width) < 1);
      assert.ok(Math.abs(media.height - media.width * 1080 / 1920) < 1);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
  }
  await page.goto(url + 'mo-62a/getting-started/next-steps/', {waitUntil: 'networkidle'});
  const nextBody = page.locator('.theme-doc-markdown');
  const destinations = await nextBody.locator('a[href]').evaluateAll(items =>
    [...new Set(items.map(i => i.getAttribute('href')).filter(h => h.startsWith('/') && !h.startsWith('//')))]);
  for (const href of destinations) {
    const response = await page.request.get(origin + href.split('#')[0]);
    assert.equal(response.status(), 200, href);
    if (href.includes('#')) assert.ok((await response.text()).includes('id="' + href.split('#')[1] + '"'), href);
  }
  for (const width of [390, 768, 1440, 1920]) {
    await page.setViewportSize({width, height: 1000});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Next steps overflow');
  }

  await page.setViewportSize({width: 390, height: 844});
  await page.goto(url, {waitUntil: 'networkidle'});
  await page.getByRole('button', {name: 'Toggle navigation bar'}).click();
  await page.locator('.navbar-sidebar').waitFor({state: 'visible'});
  assert.ok((await page.locator('.navbar-sidebar').innerText()).includes('Mo 62A'));
  await page.getByRole('button', {name: 'Close navigation bar'}).click();
  await page.locator('.navbar-sidebar').waitFor({state: 'hidden'});
  await page.getByRole('button', {name: 'Toggle navigation bar'}).click();
  await page.locator('.navbar-sidebar').waitFor({state: 'visible'});
  assert.ok((await page.locator('.navbar-sidebar').innerText()).includes('Mo 62A'));
  await page.getByRole('button', {name: 'Close navigation bar'}).click();
  await page.locator('.navbar-sidebar').waitFor({state: 'hidden'});
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
  console.log('Mo documentation browser tests passed: ' + base + ', sidebar toggle, both boards, shared MDX, placeholders, downloads, search and mobile.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
