import './style.css';
import {createSculpture,type CameraState} from './scene';
import {Transport} from './transport';import {Score,NOTES,VARIATIONS} from './score';import {initialState,encodeState} from './state';import {InstrumentAudio} from './audio';import {attachInput} from './input';import {mod,WHEEL,WHEEL_R,sampleRoute} from './routes';
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
function start(){
const params=new URLSearchParams(location.search.length<2000?location.search:'');
const imported=initialState(location.hash);const score=new Score(imported.s);const audio=new InstrumentAudio();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fixed=Number(params.get('t'));const initialTime=params.has('t')&&Number.isFinite(fixed)?Math.max(-48,Math.min(100000,fixed)):17.3;
const transport=new Transport(()=>performance.now()/1000,initialTime,!reduced.matches&&!params.has('t'));
const canvas=$<HTMLCanvasElement>('scene');let sculpture:ReturnType<typeof createSculpture>;let dirty=true,scrubbing=false,hidden=false,raf=0,lastUI=0,toastTimer=0,lastFrame=performance.now(),lastDraw=0;
let quality=params.get('quality')==='low'?'low':'high';let frameTimes:number[]=[];let pendingAt:number|null=null;
function announce(message:string){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>$('toast').classList.remove('show'),3100);}
function fallback(message:string){$('fallback-message').textContent=message;$('fallback').hidden=false;}
try{if(params.get('no-graphics')==='1')throw new Error('WebGL disabled for fallback review');sculpture=createSculpture(canvas,params.get('single')==='1'?1:8,Number(params.get('lighting'))||0);sculpture.setCamera(imported.c);if(quality==='low')sculpture.setQuality('low');}
catch(error){console.warn('Counterpoint graphics unavailable:',error instanceof Error?error.message:'WebGL unavailable');fallback('This instrument needs WebGL 2 to move. Enable 3D graphics in your browser, then try again.');transport.pause();$('retry').onclick=()=>location.reload();for(const el of document.querySelectorAll<HTMLButtonElement>('.dock button,#variation'))el.disabled=true;$('about-open').onclick=()=>$<HTMLDialogElement>('about').showModal();for(const close of document.querySelectorAll<HTMLButtonElement>('dialog .close'))close.onclick=()=>close.closest('dialog')!.close();return;}
const s=sculpture!;
const slider=$<HTMLInputElement>('time');const notes=$('parts-panel').querySelector('.notes')!;
NOTES.forEach((note,i)=>{const b=document.createElement('button');b.className='note';b.dataset.note=String(i);b.setAttribute('aria-label',`${note.name} voice`);b.setAttribute('aria-pressed',String(imported.s.mask[i]));b.innerHTML=`<span class="pip" aria-hidden="true"></span><span>${note.name}</span>`;b.onclick=()=>toggleNote(i);notes.append(b);});
function updateUI(){const t=transport.read();const desired=score.desired();const active=score.at(t);
 $('play-label').textContent=transport.playing?'Pause':'Play';$('play-icon').textContent=transport.playing?'Ⅱ':'▷';$('play').setAttribute('aria-label',transport.playing?'Pause':'Play');
 $('sound-label').textContent=audio.enabled?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(audio.enabled));
 $('play-state').classList.toggle('held',!transport.playing);$('play-state').querySelector('span')!.textContent=scrubbing?'TURNING TIME':transport.playing?'IN MOTION':'TIME HELD';
 const start=Math.floor(t/48)*48;if(document.activeElement!==slider&&!scrubbing){slider.min=String(start);slider.max=String(start+48);}slider.value=String(t);slider.setAttribute('aria-valuetext',`${mod(t,48).toFixed(1)} seconds in the phrase`);
 const secs=Math.floor(mod(t,48));$('clock').textContent=`00:${String(secs).padStart(2,'0')}`;
 $('variation-name').textContent=VARIATIONS[desired.variation];$('variation-number').textContent=['I','II','III'][desired.variation];$('variation').setAttribute('aria-label','Change composition: '+VARIATIONS[desired.variation]);
 for(const b of notes.querySelectorAll<HTMLButtonElement>('button')){const i=Number(b.dataset.note);b.setAttribute('aria-pressed',String(desired.mask[i]));b.classList.toggle('pending',desired.mask[i]!==active.mask[i]);}
 if(pendingAt!==null&&t>=pendingAt){pendingAt=null;$('queue-status').textContent='In-flight marbles finish their turn.';}
}
function pause(){transport.pause();audio.cancel();dirty=true;updateUI();}
function play(){if(document.hidden)return;transport.play();audio.cancel();dirty=true;updateUI();}
function seek(t:number){if(!Number.isFinite(t))return;transport.seek(Math.max(-100000,Math.min(1e8,t)));audio.cancel();dirty=true;updateUI();}
function toggleNote(i:number){const desired=score.desired();desired.mask[i]=!desired.mask[i];pendingAt=score.queue(desired,transport.read());audio.cancel();$('queue-status').textContent='Queued for the next turn.';announce(`${NOTES[i].name} ${desired.mask[i]?'returns':'will rest'} · travelling marbles finish their turn`);dirty=true;updateUI();}
$('play').onclick=()=>transport.playing?pause():play();
$('sound').onclick=async()=>{if(audio.enabled&&audio.context?.state==='running'){transport.useClock(()=>performance.now()/1000);audio.disable();announce('Sound off');}else{try{await audio.enable();transport.useClock(()=>audio.context!.currentTime);audio.context!.onstatechange=()=>{if(audio.enabled&&audio.context?.state!=='running'){pause();announce('Sound paused · tap Sound to reconnect');}};announce('Sound on · each marble plays its note');}catch{audio.disable();announce('Sound could not start. Tap Sound to try again.');}}updateUI();};
slider.addEventListener('pointerdown',()=>{pause();scrubbing=true;});slider.addEventListener('input',()=>{const value=Number(slider.value);pause();seek(value);});slider.addEventListener('change',()=>{scrubbing=false;updateUI();});slider.addEventListener('pointercancel',()=>{scrubbing=false;updateUI();});
$('reset').onclick=()=>{s.reset();dirty=true;announce('View reset');};
$('variation').onclick=()=>{const c=score.desired();c.variation=(c.variation+1)%3;pendingAt=score.queue(c,transport.read());audio.cancel();$('queue-status').textContent='Queued for the next turn.';announce(`${VARIATIONS[c.variation]} · joins on the next turn`);dirty=true;updateUI();};
$('parts').onclick=()=>{const panel=$('parts-panel');panel.hidden=!panel.hidden;$('parts').setAttribute('aria-expanded',String(!panel.hidden));};
function sharedURL(){return location.origin+location.pathname+encodeState(score.desired(),s.getCamera());}
$('share').onclick=async()=>{const url=sharedURL();try{await navigator.clipboard.writeText(url);history.replaceState(null,'',encodeState(score.desired(),s.getCamera()));announce('Arrangement link copied');}catch{$<HTMLInputElement>('share-url').value=url;$<HTMLDialogElement>('share-dialog').showModal();$<HTMLInputElement>('share-url').select();}};
$('copy-link').onclick=async()=>{try{await navigator.clipboard.writeText($<HTMLInputElement>('share-url').value);$<HTMLDialogElement>('share-dialog').close();announce('Arrangement link copied');}catch{const field=$<HTMLInputElement>('share-url');field.focus();field.select();announce('Link selected · copy with your keyboard');}};
$('about-open').onclick=()=>$<HTMLDialogElement>('about').showModal();for(const close of document.querySelectorAll<HTMLButtonElement>('dialog .close'))close.onclick=()=>close.closest('dialog')!.close();
$('retry').onclick=()=>location.reload();
const input=attachInput(canvas,s,{time:()=>transport.read(),begin:()=>{pause();scrubbing=true;updateUI();},seek,end:(forward)=>{scrubbing=false;if(forward)play();else{pause();announce('Time held · explore, or press Play');}},note:toggleNote,changed:()=>{dirty=true;}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){$('parts-panel').hidden=true;$('parts').setAttribute('aria-expanded','false');input.cancel();}if(e.code==='Space'&&e.target===canvas){e.preventDefault();transport.playing?pause():play();}});
window.addEventListener('resize',()=>{dirty=true;});
reduced.addEventListener('change',e=>{if(e.matches)pause();});
document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(hidden){input.cancel();pause();cancelAnimationFrame(raf);}else{lastFrame=performance.now();dirty=true;raf=requestAnimationFrame(frame);announce('Time held while you were away · Play to continue');}});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();pause();cancelAnimationFrame(raf);fallback('The instrument is resting. Graphics were interrupted.');});
canvas.addEventListener('webglcontextrestored',()=>{$('fallback').hidden=true;dirty=true;lastFrame=performance.now();raf=requestAnimationFrame(frame);announce('Graphics restored · Play to continue');});
function frame(now:number){if(hidden)return;const elapsed=now-lastFrame;lastFrame=now;if(transport.playing&&elapsed<1000){frameTimes.push(elapsed);if(frameTimes.length>120)frameTimes.shift();}
 if(!params.has('quality')&&quality==='high'&&frameTimes.length===90&&frameTimes.reduce((a,b)=>a+b,0)/90>35){quality='low';s.setQuality('low');dirty=true;}
 if((dirty||transport.playing)&&(quality==='high'||now-lastDraw>=31||dirty)){const t=transport.read();s.update(t,score.at(t).mask,(i,e)=>score.audible(i,e));s.render();lastDraw=now;dirty=false;}
 if(transport.playing&&now-lastUI>120){updateUI();lastUI=now;}raf=requestAnimationFrame(frame);
}
window.setInterval(()=>audio.schedule(score,transport.read(),transport.playing&&!scrubbing&&!hidden),40);
updateUI();s.update(transport.read(),score.at(transport.read()).mask,(i,e)=>score.audible(i,e));s.render();raf=requestAnimationFrame(frame);
if(import.meta.env.DEV||params.get('test')==='1'){
 (window as any).__counterpoint={
  state:()=>({time:transport.read(),playing:transport.playing,scrubbing,sound:audio.enabled,audioState:audio.context?.state??'not-created',score:score.desired(),revisions:score.revisions,camera:s.getCamera(),quality,hidden}),
  setTime:(t:number)=>{pause();seek(t);s.update(t,score.at(t).mask,(i,e)=>score.audible(i,e));s.render();},
  setCamera:(c:CameraState)=>{s.setCamera(c);dirty=true;},setQuality:(q:string)=>{quality=q;s.setQuality(q);dirty=true;},
  capture:()=>{pause();cancelAnimationFrame(raf);s.render();},
  stats:()=>({...s.stats(),frameSamples:frameTimes.length,meanFrameMs:frameTimes.length?frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length:0}),
  positions:()=>s.balls.map((b,i)=>({note:i,visible:b.visible,position:b.position.toArray(),stage:sampleRoute(s.routes[i],transport.read()).stage})),
  targets:()=>({notes:s.routes.map(r=>s.project(r.plate)),wheel:s.project(WHEEL.clone().add({x:WHEEL_R*.65,y:WHEEL_R*.65,z:1.16} as any)),wheelCenter:s.project(WHEEL.clone().add({x:0,y:0,z:1.16} as any)),wheelTop:s.project(WHEEL.clone().add({x:0,y:WHEEL_R,z:1.16} as any))}),
  hit:s.hit,events:(a:number,b:number)=>score.events(a,b),scheduled:()=>audio.scheduled,
  loseContext:()=>s.renderer.forceContextLoss(),restoreContext:()=>s.renderer.forceContextRestore(),
  offlineAudio:(duration=48)=>audio.offline(score,duration).then(data=>Array.from(data)),share:sharedURL,
  suspendAudio:()=>audio.context?.suspend(),play,pause
 };
}

}
start();
