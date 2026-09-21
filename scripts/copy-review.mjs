import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='evidence/audio-fix/copy';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:960,height:720},recordVideo:{dir:dir+'/recordings',size:{width:960,height:720}}});
 const began=Date.now();const page=await context.newPage();page.setDefaultTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.argv[2]||'http://localhost:5175/')+'?test=1&t=20&quality=low');await page.waitForFunction(()=>!!window.__counterpoint);
 await page.locator('#play').click();const started=(Date.now()-began)/1000;
 await page.waitForTimeout(24000);
 const w=await page.evaluate(()=>window.__counterpoint.targets().wheel);await page.mouse.move(w.x,w.y);await page.mouse.down();await page.mouse.move(w.x-70,w.y-25,{steps:8});await page.mouse.up();
 await page.evaluate(()=>window.__counterpoint.pause());await page.mouse.move(80,250);await page.mouse.down();await page.mouse.move(180,280,{steps:6});await page.mouse.up();await page.locator('#reset').click();await page.locator('#play').click();await page.waitForTimeout(3000);
 const ended=(Date.now()-began)/1000;await page.evaluate(()=>window.__counterpoint.pause());
 const checks=[];
 for(const width of [960,320]){
  await page.setViewportSize({width,height:720});await page.locator('#about-open').click();await page.screenshot({path:`${dir}/about-${width}.png`,timeout:120000});
  const about=await page.locator('#about').evaluate(el=>({text:el.textContent,width:el.clientWidth,scrollWidth:el.scrollWidth}));assert.ok(about.scrollWidth<=about.width);checks.push({width,about});
  await page.keyboard.press('Escape');await page.locator('#parts').click();await page.screenshot({path:`${dir}/notes-${width}.png`,timeout:120000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#parts').click();
 }
 const video=page.video();await context.close();await video.saveAs(dir+'/recording.webm');assert.deepEqual(errors,[]);
 await writeFile(dir+'/review.json',JSON.stringify({started,ended,checks,errors},null,2)+'\n');
 console.log(JSON.stringify({started,ended,errors}));
}finally{await browser.close();}
