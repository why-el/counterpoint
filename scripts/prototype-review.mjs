import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('evidence/prototype',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
for(const [name,query] of [['warm','t=21'],['rim','t=21&lighting=1'],['light','t=21&lighting=2'],['front','t=21&angle=0.12'],['side','t=21&angle=1.2']]){
 await page.goto('http://localhost:5174/?'+query);await page.waitForFunction(()=>!!window.__counterpoint);await page.screenshot({path:'evidence/prototype/'+name+'.png'});
}
await page.goto('http://localhost:5174/?t=23.7');await page.waitForFunction(()=>!!window.__counterpoint);
for(const t of [23.7,23.9,24,24.12,24.6,28.48,28.5,34.49,34.5,40.49,40.5]){await page.evaluate(t=>window.__counterpoint.setTime(t),t);await page.screenshot({path:'evidence/prototype/t-'+t+'.png'});}
await writeFile('evidence/prototype/metrics.json',JSON.stringify({errors,stats:await page.evaluate(()=>window.__counterpoint.stats())},null,2));
console.log(JSON.stringify({errors,stats:await page.evaluate(()=>window.__counterpoint.stats())}));await browser.close();
