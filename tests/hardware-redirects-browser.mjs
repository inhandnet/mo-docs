import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const base = process.env.DOCS_BASE_URL ?? '/';
const hardware = (process.env.HARDWARE_URL ?? 'https://developer.inhand.online/hardware-docs').replace(/\/$/,'');
const routes = JSON.parse(fs.readFileSync('src/data/hardware-routes.json','utf8'));
const root = path.resolve('build');
const types = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
const server = http.createServer((req,res) => {
  const url = new URL(req.url,'http://localhost');
  if(!url.pathname.startsWith(base)){res.writeHead(404).end();return;}
  let file=path.resolve(root,decodeURIComponent(url.pathname.slice(base.length)));
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',types[path.extname(file)]??'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch();
try {
  const page=await browser.newPage();
  // Intercept destination to test redirect semantics without a network dependency.
  await page.route(hardware+'/**', route=>route.fulfill({contentType:'text/html',body:'<h1>Hardware destination</h1>'}));
  for(const record of routes){
    const suffix='?from=legacy#'+(record.anchors[0]??'section');
    await page.goto(origin+base+record.route+suffix,{waitUntil:'domcontentloaded'});
    await page.waitForURL(hardware+'/'+record.route+suffix);
    assert.equal(await page.locator('h1').innerText(),'Hardware destination');
  }
  const context=await browser.newContext({javaScriptEnabled:false});
  const fallback=await context.newPage();
  await fallback.goto(origin+base+routes[0].route);
  assert.equal(await fallback.getByRole('link',{name:'Continue to this page in Hardware documentation'}).getAttribute('href'),hardware+'/'+routes[0].route);
  assert.equal(await fallback.locator('meta[name="robots"]').getAttribute('content'),'noindex, follow');
  await context.close();
  console.log(`Verified ${routes.length} redirects with queries/fragments and no-JS fallback.`);
} finally {
  await browser.close(); await new Promise(resolve=>server.close(resolve));
}
