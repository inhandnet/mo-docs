import assert from 'node:assert/strict';

// Regression checks for the site's typography and layout.
// Font files must load locally, not merely appear in a fallback list.
export async function checkBrand(page, width) {
  await page.evaluate(() => document.fonts.ready);
  const family = 'Roboto, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
  const expected = {
    body: {fontFamily: family, fontSize: '18px', fontWeight: '400', lineHeight: '27.9px', color: 'rgb(34, 34, 34)'},
    '.navbar': {height: '81px'},
    '.navbar__logo': {height: width >= 997 && width < 1340 ? '49.5px' : '58.5px'},
    '.navbar__title': {fontSize: width >= 997 && width < 1340 ? '22.5px' : '27px', fontWeight: '700'},
    '.navbar__link--active': {fontSize: width >= 997 && width < 1340 ? '17.1px' : '18.9px', fontWeight: '700', color: 'rgb(0, 166, 81)'},
    '.theme-doc-sidebar-menu': {fontSize: '18px'},
    '.menu__link--active:not(.menu__link--sublist)': {fontSize: '18px', fontWeight: '700', color: 'rgb(0, 166, 81)', backgroundColor: 'rgba(0, 0, 0, 0.05)'},
    '.theme-doc-markdown h1': {fontFamily: family, fontSize: '38.7px', fontWeight: '700', lineHeight: '48.375px', color: 'rgb(0, 141, 69)'},
    '.theme-doc-markdown h2': {fontFamily: family, fontSize: '28.8px', fontWeight: '700', lineHeight: '36px', color: 'rgb(34, 34, 34)'},
    '.theme-doc-markdown p': {fontFamily: family, fontSize: '18px', fontWeight: '400', lineHeight: '27.9px', color: 'rgb(34, 34, 34)'},
  };
  const actual = await page.evaluate(expected => Object.fromEntries(Object.entries(expected).map(([selector, props]) => {
    const el = document.querySelector(selector);
    return [selector, el ? Object.fromEntries(Object.keys(props).map(p => [p, getComputedStyle(el)[p]])) : null];
  })), expected);
  for (const [selector, props] of Object.entries(expected)) {
    // Docusaurus unmounts the desktop sidebar and nav links on small screens.
    if (width < 997 && actual[selector] === null && (selector.includes('menu') || selector === '.navbar__link--active')) continue;
    assert.deepEqual(actual[selector], props, `${width}px brand mismatch: ${selector}`);
  }
  assert.ok(await page.evaluate(() => [...document.fonts].some(f => f.family === 'Roboto' && f.status === 'loaded')), 'Roboto must actually load');
  if (width >= 997) {
    const buy = await page.locator('.navbar__link.navbar-buy').boundingBox();
    assert.ok(buy.x + buy.width <= width, 'Navbar Buy button must remain visible');
    assert.equal(await page.locator('.search-trigger').evaluate(el => el.scrollWidth <= el.clientWidth), true, 'Search control must not clip');
  }
}
