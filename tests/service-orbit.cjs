const {chromium,firefox,webkit}=require('playwright');const assert=require('node:assert/strict');const Axe=require('@axe-core/playwright').default;
(async()=>{const engine=process.env.BROWSER||'chrome';const b=await ({chrome:chromium,firefox,webkit}[engine]).launch({headless:true,...(engine==='chrome'?{channel:'chrome'}:{})});try{const c=await b.newContext({viewport:{width:1440,height:1000}});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.BASE_URL||'http://localhost:5173');
 const section=p.locator('.service-orbit');assert.equal(await section.count(),1,'New services showcase exists');
 for(const width of [320,390,768,1024,1440,1920]){await p.setViewportSize({width,height:1000});await section.scrollIntoViewIfNeeded();
  for(let i=0;i<4;i++){await section.getByRole('tab').nth(i).click();await p.waitForTimeout(250);assert.equal(await section.getByRole('tab').nth(i).getAttribute('aria-selected'),'true');assert.equal(await section.getByRole('tabpanel').count(),1);assert.ok(await section.getByRole('tabpanel').locator('a').getAttribute('href'));}
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow at '+width);
 }
 await p.setViewportSize({width:390,height:844});await section.getByRole('tab').first().focus();await p.keyboard.press('ArrowRight');assert.equal(await section.getByRole('tab').nth(1).getAttribute('aria-selected'),'true');
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);assert.notEqual(await section.getAttribute('data-scroll-mode'),'true');
 const audit=await new Axe({page:p}).include('.service-orbit').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[]);assert.deepEqual(errors,[]);
 console.log('PASS 4 services at 6 widths, links, keyboard, reduced motion and accessibility');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
