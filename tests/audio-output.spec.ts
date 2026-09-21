import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';

for(const mode of ['stall','cancel']){
 test(`recorded output ${mode==='stall'?'survives a rendering stall':'cancels queued notes during a stall'}`,async({page,browserName})=>{
  test.skip(browserName!=='chromium'||!!process.env.COUNTERPOINT_URL,'The audio fixture runs in local Chromium; published output is checked by audio-output-probe.mjs.');
  await page.goto('/tests/audio-harness.html');
  await page.waitForFunction(()=>typeof (window as any).runAudioRegression==='function');
  await page.evaluate(mode=>{document.getElementById('start')!.onclick=()=>{(window as any).audioResult=(window as any).runAudioRegression(mode);};},mode);
  await page.locator('#start').click();
  const result=await page.evaluate(()=>(window as any).audioResult);
  expect(result.duration).toBeGreaterThan(2);
  expect(result.scheduled.some((event:{time:number})=>event.time===21)).toBe(true);
  if(mode==='stall'){
   expect(result.peak).toBeGreaterThan(.05);
   expect(result.peak).toBeLessThan(.7);
   expect(result.rms).toBeGreaterThan(.005);
  }else expect(result.peak).toBeLessThan(.000001);
  await mkdir('evidence/audio-fix',{recursive:true});
  await writeFile(`evidence/audio-fix/test-${mode}.webm`,Buffer.from(result.base64,'base64'));
  delete result.base64;
  await writeFile(`evidence/audio-fix/test-${mode}.json`,JSON.stringify(result,null,2)+'\n');
 });
}

test('all arrangements retain headroom with the live gain and compressor',async({page,browserName})=>{
 test.skip(browserName!=='chromium'||!!process.env.COUNTERPOINT_URL,'Local numerical audio review.');
 await page.goto('/tests/audio-harness.html');
 await page.waitForFunction(()=>typeof (window as any).analyzeArrangements==='function');
 const results=await page.evaluate(()=>(window as any).analyzeArrangements());
 expect(results).toHaveLength(3);
 for(const result of results){expect(result.peak).toBeGreaterThan(.05);expect(result.peak).toBeLessThan(.4);expect(result.rms).toBeGreaterThan(.005);expect(result.maxJump).toBeLessThan(.08);}
 await mkdir('evidence/audio-fix',{recursive:true});
 await writeFile('evidence/audio-fix/arrangements.json',JSON.stringify(results,null,2)+'\n');
});
