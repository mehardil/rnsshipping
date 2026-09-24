const { chromium, firefox, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
fs.mkdirSync('artifacts', { recursive: true });
const base = process.env.BASE_URL || 'http://localhost:4173';
const routes = ['/', '/about', '/services', '/contact', '/services/technical-services', '/services/ship-chandelling', '/services/spare-parts-logistics', '/services/automation'];
(async()=>{
  const report=[];
  for (const [name,engine] of [['Chrome',chromium],['Firefox',firefox],['WebKit',webkit]]) {
    const browser=await engine.launch({headless:true,...(name==='Chrome'?{channel:'chrome'}:{})});
    const context=await browser.newContext();const page=await context.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    for(const route of routes) for(const width of [320,768,1440]) {
      await page.setViewportSize({width,height:900});
      await page.goto(base+route,{waitUntil:'domcontentloaded'});await page.waitForTimeout(200);
      assert.equal(await page.locator('h1').count(),1,`${name} ${route} h1`);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${name} ${route} ${width} overflow`);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://rnsshipping.com'+route);
      report.push({browser:name,route,width,passed:true});
    }
    await page.setViewportSize({width:390,height:844});await page.goto(base);
    await page.locator('.nav__toggle').click();assert.equal(await page.locator('.nav__toggle').getAttribute('aria-expanded'),'true');
    await page.waitForFunction(()=>document.activeElement?.classList.contains('nav__link'));
    await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('.nav__toggle').evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('Escape');assert.equal(await page.locator('.nav__toggle').getAttribute('aria-expanded'),'false');
    await page.goto(base+'/contact?service=Marine%20Automation');await page.waitForTimeout(200);
    await page.waitForFunction(()=>document.querySelector('#subject').value === 'Marine Automation');
    assert.equal(await page.locator('#subject').inputValue(),'Marine Automation');
    await page.locator('button[type=submit]').click();assert.equal(await page.locator('a').filter({hasText:'Open email draft'}).count(),0);
    await page.locator('#name').fill('Test & Review');await page.locator('#email').fill('review@example.com');await page.locator('#message').fill('Vessel Test & port call.\nParts #123');
    await page.locator('button[type=submit]').click();const draft=page.getByRole('link',{name:'Open email draft'});
    const mail=new URL(await draft.getAttribute('href'));assert.equal(mail.protocol,'mailto:');assert.equal(mail.pathname,'info@rnsshipping.com');assert.match(mail.searchParams.get('body'),/Vessel Test & port call/);assert.match(mail.searchParams.get('body'),/review@example.com/);
    assert.equal(await page.getByText('Your enquiry has been received.',{exact:false}).count(),0);
    await page.getByRole('button',{name:'Edit enquiry'}).click();assert.equal(await page.locator('#name').inputValue(),'Test & Review');
    await page.goto(base+'/services');await page.locator('.service-index a').last().click();await page.waitForFunction(()=>Math.abs(document.querySelector('#automation').getBoundingClientRect().top)<200);assert.ok(await page.locator('#automation').evaluate(el=>Math.abs(el.getBoundingClientRect().top)<200));
    await page.setViewportSize({width:844,height:390});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    await page.goto(base);await page.getByRole('button',{name:'Pause motion',exact:true}).click();assert.equal(await page.locator('html').getAttribute('data-motion'),'paused');
    await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForTimeout(300);assert.equal(await page.locator('html').getAttribute('data-motion'),'paused');
    assert.deepEqual([...new Set(errors)],[],name+' JavaScript errors');
    await browser.close();console.log(name+': 24 route/width checks + menu, form, anchors, landscape and reduced-motion passed');
  }
  const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  for(const route of routes){await page.goto(base+route);assert.equal(await page.locator('h1').count(),1);assert.ok((await page.locator('main').innerText()).length>700);assert.equal(await page.locator('meta[name=description]').count(),1);assert.ok(await page.locator('h1').isVisible());}
  await browser.close();fs.writeFileSync('artifacts/cross-browser.json',JSON.stringify(report,null,2));console.log('All 8 routes readable without JavaScript.');
})().catch(e=>{console.error(e);process.exit(1)});
