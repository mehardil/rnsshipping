const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage();await page.goto(process.env.BASE_URL||'http://localhost:5173');
 await page.locator('.testi').scrollIntoViewIfNeeded();
 assert.equal(await page.locator('.testi .swiper').count(),1,'Use a single looping viewport');
 for(const width of [320,390,680,768,1024,1440,1920,2560]){
  await page.setViewportSize({width,height:1000});
  await page.waitForTimeout(100);
  await page.locator('.testi .swiper').evaluate(el=>el.swiper.autoplay.stop());
  for(let step=0;step<15;step++){
   await page.locator('.testi .swiper').evaluate(el=>el.swiper.slideNext(0));
   await page.waitForTimeout(40);
   const fit=await page.locator('.testi .swiper').evaluate(el=>{const bounds=el.getBoundingClientRect();const cards=[...el.querySelectorAll('.swiper-slide')].map(c=>c.getBoundingClientRect()).filter(r=>r.right>bounds.left+2&&r.left<bounds.right-2);return {count:cards.length,expected:el.swiper.params.slidesPerView,full:cards.every(r=>r.left>=bounds.left-2&&r.right<=bounds.right+2)}});
   assert.equal(fit.count,fit.expected,`empty space at ${width}, step ${step}`);assert.ok(fit.full,`cut card at ${width}`);
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
 assert.equal(await page.locator('.testi .swiper').evaluate(el=>el.swiper.autoplay.running),false);
 assert.equal(await page.locator('.testi button').count(),0);
 console.log('PASS 8 widths, 120 loop positions, complete cards, no gaps or controls, reduced motion');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
