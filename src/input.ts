import type {createSculpture} from './scene';
import type {CameraState} from './scene';
type Sculpture=ReturnType<typeof createSculpture>;
type Callbacks={time:()=>number;begin:()=>void;seek:(t:number)=>void;end:(forward:boolean)=>void;note:(n:number)=>void;changed:()=>void};
export function attachInput(canvas:HTMLCanvasElement,s:Sculpture,cb:Callbacks){
 s.controls.enabled=false;
 const touches=new Map<number,{x:number;y:number}>();let pinch:{distance:number;radius:number}|null=null;
 let active:{id:number;kind:string;note:number;x:number;y:number;lastX:number;lastY:number;angle:number;time:number;camera:CameraState;moved:boolean;lastDelta:number;lastMove:number}|null=null;
 const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
 function finish(cancel=false){if(!active)return;const a=active;active=null;if(canvas.hasPointerCapture(a.id))canvas.releasePointerCapture(a.id);canvas.classList.remove('grabbing');if(a.kind==='wheel')cb.end(!cancel&&a.lastDelta>.01&&performance.now()-a.lastMove<180);else if(a.kind==='note'&&!a.moved&&!cancel)cb.note(a.note);cb.changed();}
 canvas.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'){touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size>=2){finish(true);const [a,b]=[...touches.values()];pinch={distance:Math.max(10,Math.hypot(a.x-b.x,a.y-b.y)),radius:s.getCamera()[2]};for(const id of touches.keys())canvas.setPointerCapture(id);canvas.classList.add('grabbing');e.preventDefault();return;}}
  if(active){finish(true);return;}if(e.button!==0)return;
  const hit=s.hit(e.clientX,e.clientY);active={id:e.pointerId,kind:hit.kind,note:hit.index,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,angle:s.wheelAngle(e.clientX,e.clientY),time:cb.time(),camera:s.getCamera(),moved:false,lastDelta:0,lastMove:0};
  canvas.setPointerCapture(e.pointerId);canvas.classList.add('grabbing');if(hit.kind==='wheel')cb.begin();e.preventDefault();
 });
 canvas.addEventListener('pointermove',e=>{
  if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch&&touches.size>=2){const [a,b]=[...touches.values()];const distance=Math.max(10,Math.hypot(a.x-b.x,a.y-b.y));const c=s.getCamera();c[2]=clamp(pinch.radius*pinch.distance/distance,7.7,17);s.setCamera(c);cb.changed();e.preventDefault();return;}
  if(!active){if(e.pointerType==='mouse'){const h=s.hit(e.clientX,e.clientY);canvas.style.cursor=h.kind==='note'?'pointer':h.kind==='wheel'?'ew-resize':'grab';}return;}const a=active;if(e.pointerId!==a.id)return;
  const distance=Math.hypot(e.clientX-a.x,e.clientY-a.y);if(distance>7)a.moved=true;
  if(a.kind==='wheel'){
   const angle=s.wheelAngle(e.clientX,e.clientY);let d=angle-a.angle;while(d>Math.PI)d-=Math.PI*2;while(d< -Math.PI)d+=Math.PI*2;
   const delta=-d*12/(Math.PI*2);a.time+=delta;a.lastDelta=delta;a.lastMove=performance.now();a.angle=angle;cb.seek(a.time);
  }else if(a.moved){const c:CameraState=[a.camera[0]-(e.clientX-a.x)*.006,clamp(a.camera[1]-(e.clientY-a.y)*.006,.30,Math.PI*.49),a.camera[2]];s.setCamera(c);cb.changed();}
  a.lastX=e.clientX;a.lastY=e.clientY;e.preventDefault();
 });
 function endPointer(e:PointerEvent,cancel=false){touches.delete(e.pointerId);if(pinch){if(touches.size<2)pinch=null;canvas.classList.remove('grabbing');}else finish(cancel);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(cancel){touches.clear();pinch=null;finish(true);}cb.changed();}
 canvas.addEventListener('pointerup',e=>endPointer(e));canvas.addEventListener('pointercancel',e=>endPointer(e,true));canvas.addEventListener('lostpointercapture',()=>{if(active)finish(true);});
 canvas.addEventListener('wheel',e=>{e.preventDefault();const c=s.getCamera();c[2]=clamp(c[2]*(1+clamp(e.deltaY,-100,100)*.001),7.7,17);s.setCamera(c);cb.changed();},{passive:false});
 canvas.addEventListener('keydown',e=>{const c=s.getCamera();let used=true;if(e.key==='ArrowLeft')c[0]-=.12;else if(e.key==='ArrowRight')c[0]+=.12;else if(e.key==='ArrowUp')c[1]=clamp(c[1]-.10,.30,Math.PI*.49);else if(e.key==='ArrowDown')c[1]=clamp(c[1]+.10,.30,Math.PI*.49);else if(e.key==='+'||e.key==='=')c[2]=clamp(c[2]-.6,7.7,17);else if(e.key==='-')c[2]=clamp(c[2]+.6,7.7,17);else if(e.key==='Home'){s.reset();cb.changed();e.preventDefault();return;}else used=false;if(used){s.setCamera(c);cb.changed();e.preventDefault();}});
 return {cancel:()=>{finish(true);pinch=null;touches.clear();canvas.classList.remove('grabbing');}};
}
