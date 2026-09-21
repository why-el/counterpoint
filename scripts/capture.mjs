import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('console',m=>{if(m.type()==='error')console.log(m.text());});page.on('pageerror',console.log);
await page.goto(process.argv[2]||'http://localhost:5174/?t=21');await page.waitForFunction(()=>!!window.__counterpoint);
await page.screenshot({path:process.argv[3]||'evidence/prototype/revised.png'});console.log(await page.evaluate(()=>window.__counterpoint.stats()));await browser.close();
