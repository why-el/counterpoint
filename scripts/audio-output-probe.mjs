import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const target=process.argv[2]||'http://localhost:5174/';const name=process.argv[3]||'before';
const browser=await chromium.launch({headless:true,ignoreDefaultArgs:['--mute-audio'],args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={target,name,errors:[]};
try{
const page=await browser.newPage({viewport:{width:960,height:720}});page.setDefaultTimeout(120000);page.on('pageerror',e=>report.errors.push(e.message));
await page.addInitScript(()=>{const Original=window.AudioContext;window.audioTaps=[];window.AudioContext=class extends Original{createDynamicsCompressor(){const node=super.createDynamicsCompressor();window.audioTaps.push(node);return node;}};});
await page.goto(target+'?test=1&t=20&quality=low');await page.waitForFunction(()=>!!window.__counterpoint);await page.locator('#sound').click();await page.waitForFunction(()=>window.__counterpoint.state().sound);
if(!new URL(target).hostname.match(/^(localhost|127\.0\.0\.1)$/)){
 report.release=await page.evaluate(async()=>{const r=await fetch('./release.json',{cache:'no-store'});if(!r.ok)throw new Error('Release metadata unavailable');return r.json();});
 if(process.argv[4])assert.equal(report.release.revision,process.argv[4]);
}
report.enabled=await page.evaluate(()=>window.__counterpoint.state());
await page.evaluate(()=>{const tap=window.audioTaps[0];const dest=tap.context.createMediaStreamDestination();tap.connect(dest);const recorder=new MediaRecorder(dest.stream);window.audioRecording={recorder,chunks:[]};recorder.ondataavailable=e=>window.audioRecording.chunks.push(e.data);recorder.start();});
if(!(await page.evaluate(()=>window.__counterpoint.state().playing)))await page.locator('#play').click();
console.log('Recording real output graph for 24 seconds');await page.waitForTimeout(24000);
report.played=await page.evaluate(()=>window.__counterpoint.state());report.scheduled=await page.evaluate(()=>window.__counterpoint.scheduled());
const result=await page.evaluate(async()=>{const r=window.audioRecording;await new Promise(resolve=>{r.recorder.onstop=resolve;r.recorder.stop();});const blob=new Blob(r.chunks,{type:r.recorder.mimeType});const raw=await blob.arrayBuffer();const buffer=await window.audioTaps[0].context.decodeAudioData(raw.slice(0));const data=buffer.getChannelData(0);let peak=0,sum=0;for(const x of data){peak=Math.max(peak,Math.abs(x));sum+=x*x;}const bins=[];for(let start=0;start<data.length;start+=buffer.sampleRate){let p=0;for(let i=start;i<Math.min(data.length,start+buffer.sampleRate);i++)p=Math.max(p,Math.abs(data[i]));bins.push(p);}let str='';const bytes=new Uint8Array(raw);for(let i=0;i<bytes.length;i+=32768)str+=String.fromCharCode(...bytes.subarray(i,i+32768));return {peak,rms:Math.sqrt(sum/data.length),duration:buffer.duration,sampleRate:buffer.sampleRate,secondPeaks:bins,mime:blob.type,base64:btoa(str)};});
await mkdir('evidence/audio-fix',{recursive:true});await writeFile(`evidence/audio-fix/${name}.webm`,Buffer.from(result.base64,'base64'));delete result.base64;report.output=result;await writeFile(`evidence/audio-fix/${name}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
assert.deepEqual(report.errors,[]);assert.ok(result.peak>.05&&result.peak<.7,'Recorded signal contains notes and retains headroom');assert.ok(result.rms>.005,'Recorded output contains notes');
assert.equal(new Set(report.scheduled.map(e=>e.generation+':'+e.id)).size,report.scheduled.length);
}finally{await browser.close();}
