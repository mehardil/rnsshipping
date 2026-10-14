const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const p=await b.newPage();await p.goto(process.env.BASE_URL||'http://localhost:5173');
for(const size of [{width:1366,height:768},{width:1280,height:650},{width:1024,height:768},{width:1440,height:900}]){
 await p.setViewportSize(size);await p.waitForTimeout(150);
 assert.equal(await p.locator('.service-orbit').getAttribute('data-scroll-mode'),'true',JSON.stringify(size));
 const range=await p.locator('.service-orbit__journey').evaluate(el=>({start:scrollY+el.getBoundingClientRect().top,travel:el.offsetHeight-el.firstElementChild.offsetHeight}));
 for(let index=0;index<4;index++){await p.evaluate(({start,travel,index})=>window.scrollTo({top:start+travel*index/3,behavior:'instant'}),{...range,index});await p.waitForTimeout(150);assert.equal(await p.locator('.service-orbit [aria-selected=true]').innerText().then(x=>x.slice(0,2)),String(index+1).padStart(2,'0'));const box=await p.locator('.service-orbit__panel:not([hidden])').boundingBox();assert.ok(box.y>=-1&&box.y+box.height<=size.height+1,'panel fits '+JSON.stringify(size));}
}
const colors=await p.evaluate(()=>['.showcase','.service-orbit','.stats-band'].map(s=>getComputedStyle(document.querySelector(s)).backgroundColor));assert.equal(new Set(colors).size,3);
console.log('PASS laptop scroll selection, full panels and three distinct backgrounds');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
