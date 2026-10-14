const {chromium,firefox,webkit}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const engine=process.env.BROWSER||'chrome';const browser=await ({chrome:chromium,firefox,webkit}[engine]).launch({headless:true,...(engine==='chrome'?{channel:'chrome'}:{})});const failures=[];try{const page=await browser.newPage({viewport:{width:1366,height:768}});const base=process.env.BASE_URL||'http://localhost:4173';const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function check(name,fn){try{await fn();console.log('PASS',name)}catch(e){failures.push(name);console.error('FAIL',name,e.message)}}
await page.goto(base);
await check('reveals replay after leaving and revisiting',async()=>{const card=page.locator('.why-card').first().locator('..');await card.scrollIntoViewIfNeeded();await page.waitForTimeout(800);assert.ok((await card.getAttribute('class')).includes('reveal-in'));await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);assert.ok(!(await card.getAttribute('class')).includes('reveal-in'),'offscreen reveal must reset');await card.scrollIntoViewIfNeeded();await page.waitForTimeout(600);assert.ok((await card.getAttribute('class')).includes('reveal-in'))});
await check('counters replay on second visit',async()=>{const counter=page.locator('.counter b').first();await counter.scrollIntoViewIfNeeded();await page.waitForTimeout(1800);assert.match(await counter.innerText(),/35/);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);await counter.scrollIntoViewIfNeeded();await page.waitForTimeout(100);assert.ok(parseInt(await counter.innerText())<35,'counter should animate again');await page.waitForTimeout(1800);assert.match(await counter.innerText(),/35/)});
await check('desktop motion initializes after mobile scrolling',async()=>{await page.setViewportSize({width:390,height:844});await page.goto(base);await page.evaluate(()=>scrollTo({top:350,behavior:'instant'}));await page.waitForTimeout(300);await page.setViewportSize({width:1366,height:768});await page.evaluate(()=>scrollTo({top:400,behavior:'instant'}));await page.waitForTimeout(1500);assert.ok(await page.locator('.hero__photo img').evaluate(el=>!!el.style.transform),'desktop parallax should initialize on resize')});
await check('carousel resumes after leaving, hover and pause',async()=>{
 await page.locator('.testi').scrollIntoViewIfNeeded();await page.mouse.move(0,0);
 const running=()=>page.waitForFunction(()=>document.querySelector('.testi .swiper').swiper.autoplay.running);
 await running();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);
 assert.equal(await page.locator('.testi .swiper').evaluate(el=>el.swiper.autoplay.running),false);
 await page.locator('.testi').scrollIntoViewIfNeeded();await running();const first=await page.locator('.testi .swiper').evaluate(el=>el.swiper.realIndex);
 await page.waitForFunction(index=>document.querySelector('.testi .swiper').swiper.realIndex!==index,first,{timeout:8000});
 await page.locator('.testi').hover();await page.waitForTimeout(100);assert.equal(await page.locator('.testi .swiper').evaluate(el=>el.swiper.autoplay.running),false);
 await page.mouse.move(0,0);await running();
 await page.getByRole('button',{name:'Pause motion',exact:true}).click();await page.locator('.testi').scrollIntoViewIfNeeded();await page.waitForTimeout(200);assert.equal(await page.locator('.testi .swiper').evaluate(el=>el.swiper.autoplay.running),false);
 await page.getByRole('button',{name:'Resume motion',exact:true}).click();await page.locator('.testi').scrollIntoViewIfNeeded();await page.mouse.move(0,0);await running();
});
await check('effects survive route and history revisits',async()=>{
 for(let repeat=0;repeat<2;repeat++){
  await page.locator('.nav__link').filter({hasText:'About'}).click();await page.waitForURL('**/about');await page.waitForFunction(()=>!!document.querySelector('.page-hero')&&!document.querySelector('.service-orbit'));await page.goBack();await page.waitForURL(base+'/');await page.locator('.service-orbit[data-enhanced]').waitFor();
  await page.locator('.why-card').first().scrollIntoViewIfNeeded();await page.waitForTimeout(800);assert.ok(await page.locator('.why-card').first().evaluate(el=>Number(getComputedStyle(el.parentElement).opacity)>0.99));
  await page.locator('.testi').scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.waitForFunction(()=>document.querySelector('.testi .swiper').swiper.autoplay.running);
 }
});
await check('reduced motion settles counters and disables parallax',async()=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.counter b').first().scrollIntoViewIfNeeded();await page.waitForTimeout(250);
 assert.match(await page.locator('.counter b').first().innerText(),/35/);assert.equal(await page.locator('.testi .swiper').evaluate(el=>el.swiper.autoplay.running),false);
 assert.equal(await page.locator('.hero__photo img').evaluate(el=>el.style.transform),'');
});
assert.deepEqual(errors,[]);if(failures.length)throw Error(failures.join(', '));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
