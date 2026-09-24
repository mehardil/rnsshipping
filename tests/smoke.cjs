const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const failures = [];
  async function check(name, run) { try { await run(); console.log('PASS', name); } catch(e) { failures.push(name); console.error('FAIL', name, e.message); } }
  const base = process.env.BASE_URL || 'http://localhost:5173';
  await page.goto(base, {waitUntil:'networkidle'});
  await check('mobile page has no horizontal overflow', async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true));
  await check('menu closes on Escape and restores focus',async()=>{ await page.locator('.nav__toggle').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.nav__toggle').getAttribute('aria-expanded'),'false');assert.equal(await page.locator('.nav__toggle').evaluate(el=>el===document.activeElement),true); });
  await check('experience counter shows real value',async()=>{await page.locator('.counter').first().scrollIntoViewIfNeeded();await page.waitForTimeout(1800);assert.match(await page.locator('.counter').first().innerText(),/35\+/);});
  await check('dedicated service content exists',async()=>{await page.goto(base+'/services/technical-services');await page.waitForTimeout(300);assert.match(await page.locator('h1').innerText(),/Technical|Repair/);});
  await check('page schema does not leak after navigation',async()=>{await page.goto(base+'/about');await page.locator('.brand').first().click();await page.waitForTimeout(300);const schema=await page.locator('#ld-page').textContent().catch(()=>null);assert.ok(!schema || !schema.includes('AboutPage'));});
  await check('unknown pages are noindex',async()=>{await page.goto(base+'/missing-page');assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);});
  await browser.close();if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
