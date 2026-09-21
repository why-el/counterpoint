import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:960,height:720}});page.setDefaultTimeout(60000);const errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto('http://localhost:5174/?t=21');await page.waitForFunction(()=>!!window.__counterpoint);
for(const [name,c] of [['three-quarter',[.675,.95,13.5]],['front',[.06,1.05,13.5]],['reverse',[-.65,.95,13.5]]]){await page.evaluate(c=>window.__counterpoint.setCamera(c),c);await page.screenshot({path:'evidence/prototype/'+name+'.png'});}
await page.evaluate(()=>window.__counterpoint.setCamera([.675,.95,11]));
for(const t of [23.7,23.95,24,24.12,24.6,28.49,28.51,34.49,34.51,40.49,40.51]){await page.evaluate(t=>window.__counterpoint.setTime(t),t);await page.screenshot({path:'evidence/prototype/t-'+t+'.png'});}
console.log({errors,stats:await page.evaluate(()=>window.__counterpoint.stats())});await writeFile('evidence/prototype/metrics.json',JSON.stringify({errors,stats:await page.evaluate(()=>window.__counterpoint.stats())},null,2));}finally{await browser.close();}
