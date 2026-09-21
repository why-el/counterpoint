import {test,expect,type Page} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const api=(page:Page)=>({state:()=>page.evaluate(()=>(window as any).__counterpoint.state())});
async function open(page:Page,suffix='?test=1&t=17.3&quality=low'){
 await page.goto('./'+suffix);await page.waitForFunction(()=>!!(window as any).__counterpoint||!document.getElementById('fallback')!.hidden);
 return await page.evaluate(()=>!!(window as any).__counterpoint);
}
test('real controls, deterministic reverse, sound, share, and camera',async({page,browserName},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const supported=await open(page);
 if(!supported){await expect(page.locator('#fallback')).toBeVisible();await page.screenshot({path:`evidence/${browserName}-fallback.png`});test.info().annotations.push({type:'coverage',description:'WebGL unavailable in this engine; illustrated fallback tested; 3D coverage UNVERIFIED'});return;}
 await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');expect((await api(page).state()).audioState).toBe('not-created');
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect.poll(async()=>(await api(page).state()).time).toBeGreaterThan(17.3);await page.getByRole('button',{name:'Pause',exact:true}).click();
 const held=(await api(page).state()).time;await page.waitForTimeout(150);expect((await api(page).state()).time).toBe(held);
 await page.evaluate(()=>(window as any).__counterpoint.setTime(21));const p1=await page.evaluate(()=>(window as any).__counterpoint.positions());
 await page.evaluate(()=>(window as any).__counterpoint.setTime(-3));await page.evaluate(()=>(window as any).__counterpoint.setTime(21));expect(await page.evaluate(()=>(window as any).__counterpoint.positions())).toEqual(p1);
 await page.locator('#time').focus();await page.keyboard.press('Home');expect((await api(page).state()).time).toBe(0);await page.keyboard.press('End');expect((await api(page).state()).time).toBe(48);await page.keyboard.press('Home');expect((await api(page).state()).time).toBe(0);
 await page.locator('#parts').click();await page.getByRole('button',{name:'D3 voice',exact:true}).click();await expect(page.getByRole('button',{name:'D3 voice',exact:true})).toHaveAttribute('aria-pressed','false');expect((await api(page).state()).score.mask[0]).toBe(false);
 await page.locator('#parts').click();await page.evaluate(()=>(window as any).__counterpoint.setTime(22));
 const targets=await page.evaluate(()=>(window as any).__counterpoint.targets());const note=targets.notes[2];expect(await page.evaluate(p=>(window as any).__counterpoint.hit(p.x,p.y),note)).toEqual({kind:'note',index:2});await page.mouse.click(note.x,note.y);expect((await api(page).state()).score.mask[2]).toBe(false);
 const c0=(await api(page).state()).camera;await page.mouse.move(80,260);await page.mouse.down();await page.mouse.move(170,300,{steps:8});await page.mouse.up();expect((await api(page).state()).camera).not.toEqual(c0);
 await page.locator('#reset').click();const cReset=(await api(page).state()).camera;await page.locator('#scene').focus();await page.keyboard.press('ArrowRight');expect((await api(page).state()).camera[0]).not.toBe(cReset[0]);await page.keyboard.press('Home');
 const w=await page.evaluate(()=>(window as any).__counterpoint.targets());const hit=await page.evaluate(p=>(window as any).__counterpoint.hit(p.x,p.y),w.wheel);expect(hit.kind).toBe('wheel');const before=(await api(page).state()).time;
 await page.mouse.move(w.wheel.x,w.wheel.y);await page.mouse.down();await page.mouse.move(w.wheel.x-52,w.wheel.y-15,{steps:8});await page.mouse.up();expect(Math.abs((await api(page).state()).time-before)).toBeGreaterThan(.05);await page.evaluate(()=>(window as any).__counterpoint.pause());
 await page.locator('#variation').click();expect((await api(page).state()).score.variation).toBe(1);
 await page.locator('#sound').click();
 if(browserName==='firefox'&&process.env.COUNTERPOINT_NO_AUDIO==='1'){
  await expect(page.locator('#toast')).toContainText('Sound could not start');expect((await api(page).state()).sound).toBe(false);test.info().annotations.push({type:'coverage',description:'Firefox audio output UNVERIFIED: no functioning server audio sink; graceful startup timeout verified.'});
 }else{
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','true');expect((await api(page).state()).audioState).toBe('running');await page.locator('#play').click();await page.waitForTimeout(600);await page.locator('#play').click();
  await page.locator('#sound').click();expect((await api(page).state()).sound).toBe(false);
 }

 await page.locator('#about-open').click();await expect(page.locator('#about')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#about')).not.toBeVisible();
 const shared=await page.evaluate(()=>(window as any).__counterpoint.share());expect(shared).toContain('#s=');await page.locator('#share').click();expect(await page.locator('#toast').textContent()||await page.locator('#share-dialog').isVisible()).toBeTruthy();
 const saved=(await api(page).state()).score;await page.goto(shared.replace('#','?test=1&t=17.3&quality=low#'));await page.waitForFunction(()=>!!(window as any).__counterpoint);expect((await api(page).state()).score).toEqual(saved);expect((await api(page).state()).sound).toBe(false);
 await mkdir('evidence',{recursive:true});await writeFile(`evidence/${browserName}-interaction.json`,JSON.stringify({errors,stats:await page.evaluate(()=>(window as any).__counterpoint.stats()),sharedState:saved},null,2));expect(errors).toEqual([]);
});
test('responsive layouts, reduced motion, keyboard and touch emulation',async({page,browser,browserName})=>{
 test.skip(browserName!=='chromium','Viewport and touch matrix is covered once in Chromium; engine interactions run separately.');
 await page.emulateMedia({reducedMotion:'reduce'});expect(await open(page,'?test=1&quality=low')).toBe(true);expect((await api(page).state()).playing).toBe(false);await page.evaluate(()=>(window as any).__counterpoint.setTime(21));
 for(const viewport of [{width:320,height:720},{width:390,height:844},{width:844,height:390},{width:1440,height:1000}]){
  await page.setViewportSize(viewport);await expect.poll(async()=>(await page.locator('#scene').screenshot({timeout:120000})).byteLength,{timeout:120000}).toBeGreaterThan(12000);expect((await api(page).state()).time).toBe(21);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const id of ['sound','play','parts','reset','share']){const box=await page.locator('#'+id).boundingBox();expect(box).not.toBeNull();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(viewport.width+1);expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height);}
  await page.screenshot({path:`evidence/viewport-${viewport.width}x${viewport.height}.png`,timeout:120000});
 }
 await page.locator('#sound').focus();await expect(page.locator('#sound')).toBeFocused();expect(await page.locator('#sound').evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');await page.keyboard.press('Tab');await expect(page.locator('#play')).toBeFocused();
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const touch=await context.newPage();await touch.goto(new URL('?test=1&quality=low',page.url()).href);await touch.waitForFunction(()=>!!(window as any).__counterpoint);await touch.locator('#parts').tap();await touch.getByRole('button',{name:'A3 voice',exact:true}).tap();expect((await api(touch).state()).score.mask[1]).toBe(false);
 const target=await touch.evaluate(()=>(window as any).__counterpoint.targets().notes[0]);await touch.touchscreen.tap(target.x,target.y);expect((await api(touch).state()).score.mask[0]).toBe(false);
 await touch.locator('#parts').tap();const beforePinch=(await api(touch).state()).camera[2];const maskBefore=(await api(touch).state()).score.mask;const cdp=await context.newCDPSession(touch);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:115,y:610,id:0},{x:275,y:610,id:1}]});
 for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:115-i*10,y:610,id:0},{x:275+i*10,y:610,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});expect((await api(touch).state()).camera[2]).toBeLessThan(beforePinch-1);expect((await api(touch).state()).camera[2]).toBeGreaterThanOrEqual(7.7);expect((await api(touch).state()).score.mask).toEqual(maskBefore);expect((await api(touch).state()).scrubbing).toBe(false);
 await context.close();
});
test('resilience, bounded URLs, offline operation and context restoration',async({page,browserName})=>{
 test.skip(browserName!=='chromium');expect(await open(page)).toBe(true);
 const baseline=await page.evaluate(()=>(window as any).__counterpoint.stats());
 for(let i=0;i<12;i++){await page.setViewportSize({width:900+(i%3)*60,height:700+(i%2)*40});await page.locator('#reset').click();await page.evaluate(t=>(window as any).__counterpoint.setTime(t),i*51.3);}
 const after=await page.evaluate(()=>(window as any).__counterpoint.stats());expect(after.geometries).toBe(baseline.geometries);expect(after.textures).toBe(baseline.textures);
 await page.context().setOffline(true);await page.locator('#parts').click();await page.getByRole('button',{name:'F4 voice',exact:true}).click();expect((await api(page).state()).score.mask[4]).toBe(false);await page.context().setOffline(false);
 await page.evaluate(()=>(window as any).__counterpoint.loseContext());await expect(page.locator('#fallback')).toBeVisible();expect((await api(page).state()).playing).toBe(false);
 await page.evaluate(()=>(window as any).__counterpoint.restoreContext());await expect(page.locator('#fallback')).not.toBeVisible();expect((await api(page).state()).playing).toBe(false);
 await page.goto('./?test=1&t=21&quality=low#s='+encodeURIComponent('x'.repeat(5000)));await page.waitForFunction(()=>!!(window as any).__counterpoint);expect((await api(page).state()).score.mask).toEqual(Array(8).fill(true));
 await page.goto('./?test=1&no-graphics=1');await expect(page.locator('#fallback')).toBeVisible();await expect(page.locator('#fallback-message')).toContainText('WebGL 2');await expect(page.locator('#play')).toBeDisabled();
});
test('audio waveform, scheduling, suspension and no duplicate strikes',async({page,browserName})=>{
 test.skip(browserName!=='chromium');expect(await open(page,'?test=1&t=20&quality=low')).toBe(true);
 const audio=await page.evaluate(async()=>{const a:number[]=await (window as any).__counterpoint.offlineAudio(24);let peak=0,sum=0,maxJump=0;for(let i=0;i<a.length;i++){peak=Math.max(peak,Math.abs(a[i]));sum+=a[i]*a[i];if(i)maxJump=Math.max(maxJump,Math.abs(a[i]-a[i-1]));}return {samples:a.length,peak,rms:Math.sqrt(sum/a.length),maxJump,tailPeak:Math.max(...a.slice(-4000).map(Math.abs))};});
 expect(audio.peak).toBeGreaterThan(.01);expect(audio.peak).toBeLessThan(.4);expect(audio.rms).toBeGreaterThan(.001);expect(audio.maxJump).toBeLessThan(.08);expect(audio.tailPeak).toBeLessThan(.001);await writeFile('evidence/audio-analysis.json',JSON.stringify(audio,null,2));
 await page.locator('#sound').click();await page.locator('#play').click();await page.waitForTimeout(1800);await page.locator('#play').click();const events=await page.evaluate(()=>(window as any).__counterpoint.scheduled());expect(events.length).toBeGreaterThan(0);expect(new Set(events.map((e:any)=>e.generation+':'+e.id)).size).toBe(events.length);await writeFile('evidence/audio-scheduled.json',JSON.stringify(events,null,2));
 await page.evaluate(()=>(window as any).__counterpoint.setTime(21));const count=(await page.evaluate(()=>(window as any).__counterpoint.scheduled())).length;await page.waitForTimeout(200);expect((await page.evaluate(()=>(window as any).__counterpoint.scheduled())).length).toBe(count);
 await page.locator('#play').click();await page.evaluate(()=>(window as any).__counterpoint.suspendAudio());await expect.poll(async()=>(await api(page).state()).playing).toBe(false);
});
