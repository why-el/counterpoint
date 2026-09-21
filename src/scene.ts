import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { materials } from './materials';
import { makeRoute, sampleRoute,railCurve,railProgress,WHEEL,WHEEL_R,BALL_R,TAU } from './routes';
export type CameraState = [number,number,number];
export function createSculpture(canvas:HTMLCanvasElement,count=8,alternate=0,initialQuality='auto') {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:false});
 const gl=renderer.getContext();const debug=gl.getExtension('WEBGL_debug_renderer_info');const rendererName=debug?String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)):'';const software=/SwiftShader|llvmpipe|Software/i.test(rendererName);let quality=initialQuality==='auto'?(software?'low':'high'):initialQuality;renderer.setPixelRatio(quality==='low'?(software?.8:1):Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=quality!=='low';renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x18201e);scene.fog=new THREE.FogExp2(0x18201e,.028);
 const mat=materials(renderer);scene.environment=mat.env.texture;scene.environmentIntensity=.55;scene.environmentRotation.y=.5;
 const camera=new THREE.PerspectiveCamera(36,1,.1,70);camera.position.set(8,6.4,10); const controls=new OrbitControls(camera,canvas);controls.target.set(0,2,0);controls.enableDamping=false;controls.minDistance=7.7;controls.maxDistance=17;controls.minPolarAngle=.30;controls.maxPolarAngle=Math.PI*.49;controls.enablePan=false;controls.rotateSpeed=.65;controls.update();
 const hemi=new THREE.HemisphereLight(0xe4eadf,0x2b3026,.55);scene.add(hemi);
 const key=new THREE.DirectionalLight(0xffe0af,2.5);key.position.set(-3,8,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.normalBias=.035;key.shadow.bias=-.0002;key.shadow.radius=3;scene.add(key);
 const rim=new THREE.DirectionalLight(0xc3d8dc,2.9);rim.position.set(4,5,-4);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xecc48e,.5);fill.position.set(-6,3,-1);scene.add(fill);
 if(alternate===1){key.intensity=2;rim.intensity=4;renderer.toneMappingExposure=1.05;}if(alternate===2){scene.background=new THREE.Color(0xc6c2b5);scene.fog=new THREE.FogExp2(0xc6c2b5,.035);renderer.toneMappingExposure=1.05;}
 const staticRoot=new THREE.Group();scene.add(staticRoot);
 const staticGeos=new Map<THREE.Material,THREE.BufferGeometry[]>();
 function part(g:THREE.BufferGeometry,m:THREE.Material,p:THREE.Vector3|number[]=[0,0,0],rot:number[]=[0,0,0],root:THREE.Object3D=staticRoot){
  const mesh=new THREE.Mesh(g,m);mesh.position.copy(Array.isArray(p)?new THREE.Vector3(...p):p);mesh.rotation.set(rot[0],rot[1],rot[2]);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 }
 function rod(a:THREE.Vector3,b:THREE.Vector3,r=.025,m:THREE.Material=mat.brass,root:THREE.Object3D=staticRoot){const g=new THREE.CylinderGeometry(r,r,a.distanceTo(b),10);const mesh=part(g,m,a.clone().add(b).multiplyScalar(.5),[0,0,0],root);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return mesh;}
 const floor=part(new THREE.PlaneGeometry(200,200),new THREE.MeshLambertMaterial({color:alternate===2?0xc6c2b5:0x17221d}),[0,-.1,0],[-Math.PI/2,0,0],scene);floor.castShadow=false;
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const shadowCtx=shadowCanvas.getContext('2d')!;const gradient=shadowCtx.createRadialGradient(64,64,20,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.7)');gradient.addColorStop(.72,'rgba(0,0,0,.45)');gradient.addColorStop(1,'rgba(0,0,0,0)');shadowCtx.fillStyle=gradient;shadowCtx.fillRect(0,0,128,128);const contact=new THREE.Mesh(new THREE.PlaneGeometry(8.4,8.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=-.095;scene.add(contact);

 part(new THREE.CylinderGeometry(3.5,3.64,.26,128),mat.stone,[0,.11,0]);
 part(new THREE.CylinderGeometry(3.51,3.51,.033,128),mat.bronze,[0,.264,0]);
 part(new THREE.CylinderGeometry(3.48,3.48,.075,128),mat.dark,[0,.306,0]);
 for(const radius of [3.28,3.32])part(new THREE.TorusGeometry(radius,.006,6,160),mat.brass,[0,.346,0],[Math.PI/2,0,0]);
 // Engraved clock divisions are repeated as a single instanced mesh.
 const ticks=new THREE.InstancedMesh(new THREE.BoxGeometry(.013,.005,.08),mat.brass,96); const dummy=new THREE.Object3D();
 for(let i=0;i<96;i++){const a=i/96*TAU;dummy.position.set(Math.cos(a)*3.12,.35,Math.sin(a)*3.12);dummy.rotation.set(0,-a+Math.PI/2,0);dummy.scale.set(1,1,i%8===0?1.7:.65);dummy.updateMatrix();ticks.setMatrixAt(i,dummy.matrix);}staticRoot.add(ticks);
 // Bearing pedestals and exposed axle.
 for(const z of [-1.29,1.29]){
  part(new RoundedBoxGeometry(.28,1.94,.20,2,.055),mat.dark,[WHEEL.x,1.29,z]);
  part(new THREE.CylinderGeometry(.33,.36,.12,40),mat.brass,[WHEEL.x,.4,z]);
  part(new THREE.TorusGeometry(.23,.055,10,48),mat.brass,[WHEEL.x,WHEEL.y,z]);
 }
 rod(new THREE.Vector3(WHEEL.x,WHEEL.y,-1.45),new THREE.Vector3(WHEEL.x,WHEEL.y,1.48),.10,mat.bronze);
 const wheel=new THREE.Group();wheel.position.copy(WHEEL);scene.add(wheel);
 for(const z of [-1.11,1.11]){
  part(new THREE.TorusGeometry(WHEEL_R,.078,12,128),mat.brass,[0,0,z],[0,0,0],wheel);
  part(new THREE.TorusGeometry(WHEEL_R-.18,.017,8,128),mat.edge,[0,0,z],[0,0,0],wheel);
  for(let i=0;i<(z>0?4:8);i++){const a=i/(z>0?4:8)*TAU;const pts=[];for(let j=0;j<=20;j++){const u=j/20;const ang=a+(1-u)*.30;pts.push(new THREE.Vector3(Math.cos(ang)*(.25+u*(WHEEL_R-.27)),Math.sin(ang)*(.25+u*(WHEEL_R-.27)),z));}part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.038,8,false),mat.brass,[0,0,0],[0,0,0],wheel);}
 }
 for(let i=0;i<8;i++){const a=i/8*TAU;rod(new THREE.Vector3(Math.cos(a)*(WHEEL_R-.12),Math.sin(a)*(WHEEL_R-.12),-1.11),new THREE.Vector3(Math.cos(a)*(WHEEL_R-.12),Math.sin(a)*(WHEEL_R-.12),1.11),.03,mat.bronze,wheel);}
 part(new THREE.CylinderGeometry(.28,.28,2.36,48),mat.brass,[0,0,0],[Math.PI/2,0,0],wheel);
 part(new THREE.CylinderGeometry(.145,.145,2.43,40),mat.ceramic,[0,0,0],[Math.PI/2,0,0],wheel);
 part(new THREE.SphereGeometry(.1,20,12),mat.bronze,[0,0,1.25],[0,0,0],wheel);
 // Small teeth identify the wheel as a manipulable mechanism.
 const teeth=new THREE.InstancedMesh(new THREE.BoxGeometry(.047,.085,.20),mat.bronze,80);
 for(let i=0;i<80;i++){const a=i/80*TAU;dummy.position.set(Math.cos(a)*(WHEEL_R+.064),Math.sin(a)*(WHEEL_R+.064),-1.12);dummy.rotation.set(0,0,a-Math.PI/2);dummy.scale.set(1,1,1);dummy.updateMatrix();teeth.setMatrixAt(i,dummy.matrix);}wheel.add(teeth);
 const wheelGeos=new Map<THREE.Material,THREE.BufferGeometry[]>();const oldWheel=[...wheel.children];for(const obj of oldWheel){if(obj instanceof THREE.Mesh&&!(obj instanceof THREE.InstancedMesh)){obj.updateMatrix();const geo=(obj.geometry.index?obj.geometry.toNonIndexed():obj.geometry.clone()).applyMatrix4(obj.matrix);const m=obj.material as THREE.Material;if(!wheelGeos.has(m))wheelGeos.set(m,[]);wheelGeos.get(m)!.push(geo);wheel.remove(obj);}}for(const [m,gs] of wheelGeos){const mesh=new THREE.Mesh(mergeGeometries(gs,false)!,m);mesh.castShadow=true;mesh.receiveShadow=true;wheel.add(mesh);gs.forEach(g=>g.dispose());}
 // An ivory gate conceals the resting marble magazine, never an exposed teleport.
 part(new RoundedBoxGeometry(.56,.46,2.24,3,.12),mat.ceramic,[WHEEL.x,.52,0]);
 for(const z of [-1.14,1.14])part(new RoundedBoxGeometry(.64,.075,.055,2,.02),mat.brass,[WHEEL.x,.49,z]);
 const routes=Array.from({length:count},(_,i)=>makeRoute(i));
 const plates:THREE.Group[]=[];const targets:THREE.Mesh[]=[];const balls:THREE.Mesh[]=[];const tines:THREE.Mesh[]=[];
 for(const r of routes){
  for(const path of [r.travel,r.returning]){
   for(const side of [-1,1])part(new THREE.TubeGeometry(railCurve(path,side),160,.017,6,false),mat.brass);
   for(let j=1;j<10;j++){const t=j/10;const p=path.getPointAt(t);const v=path.getTangentAt(t);const n=new THREE.Vector3(-v.z,0,v.x).normalize();const a=p.clone().addScaledVector(n,-.085);a.y-=.11;const b=p.clone().addScaledVector(n,.085);b.y-=.11;rod(a,b,.012,mat.bronze);}
  }
  // Slender struts explain the suspended rails without filling the negative space.
  if(r.index%2===0){for(const t of [.25,.63]){const p=r.travel.getPointAt(t);p.y-=.13;rod(new THREE.Vector3(p.x,.35,p.z),p,.022,mat.bronze);part(new THREE.CylinderGeometry(.08,.12,.055,16),mat.brass,[p.x,.375,p.z]);}}
  const plateGroup=new THREE.Group();plateGroup.position.copy(r.plate);scene.add(plateGroup);plates.push(plateGroup);
  const ceramic=mat.ceramic.clone();const plate=part(new RoundedBoxGeometry(.72,.09,.21,4,.035),ceramic,[0,0,0],[0,0,0],plateGroup);plate.userData.note=r.index;targets.push(plate);for(const x of [-.27,.27]){const pin=part(new THREE.SphereGeometry(.017,8,6),mat.bronze,[x,.045,0],[0,0,0],plateGroup);pin.scale.y=.4;}
  for(const dx of [-.15,.15]){
   rod(new THREE.Vector3(r.plate.x+dx,.35,r.plate.z),new THREE.Vector3(r.plate.x+dx,r.plate.y-.10,r.plate.z),.022,mat.brass);
   part(new THREE.SphereGeometry(.044,12,8),mat.bronze,[r.plate.x+dx,r.plate.y-.075,r.plate.z]);
  }
  part(new RoundedBoxGeometry(.34,.065,.18,2,.025),mat.bronze,r.plate.clone().add(new THREE.Vector3(0,-.14,0)));
  const gate=part(new THREE.BoxGeometry(.46,.018,.04),mat.edge,r.plate.clone().add(new THREE.Vector3(-.14,-.09,0)),[0,0,0],scene);tines.push(gate);
  const ball=part(new THREE.SphereGeometry(BALL_R,24,16),mat.ceramic,[0,0,0],[0,0,0],scene);balls.push(ball);
  // A fine equator makes rolling direction legible up close.
  const stripe=new THREE.Mesh(new THREE.TorusGeometry(BALL_R+.0005,.002,4,32),mat.bronze);stripe.rotation.y=Math.PI/2;ball.add(stripe);
 }
 // Merge fixed components by material to keep the intricate assembly inexpensive.
 staticRoot.updateMatrixWorld(true);
 const remove:THREE.Object3D[]=[];
 staticRoot.traverse(o=>{if(o instanceof THREE.Mesh&&!(o instanceof THREE.InstancedMesh)){const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld);const attr=g.attributes;for(const k of Object.keys(attr))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);if(!staticGeos.has(o.material as THREE.Material))staticGeos.set(o.material as THREE.Material,[]);staticGeos.get(o.material as THREE.Material)!.push(g);remove.push(o);}});
 for(const obj of remove)staticRoot.remove(obj);
 for(const [m,gs] of staticGeos){const g=mergeGeometries(gs,false);if(g){const mesh=new THREE.Mesh(g,m);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);}for(const geo of gs)geo.dispose();}
 let width=1,height=1;
 function resize(){width=canvas.clientWidth;height=canvas.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=Math.min(85,2*Math.atan(Math.tan(Math.PI/10)/Math.min(1,camera.aspect))*180/Math.PI);camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 function update(time:number,enabled:boolean[]=Array(8).fill(true),visible?:(index:number,eventTime:number)=>boolean){
  wheel.rotation.z=-time*TAU/12;
  for(let i=0;i<routes.length;i++){const s=sampleRoute(routes[i],time);balls[i].position.copy(s.position);balls[i].visible=s.visible&&(visible?visible(i,time-s.age):enabled[i]);let roll=-time*TAU/12;if(s.stage==='rail')roll=-routes[i].travel.getLength()*railProgress((s.age+7.5)/7.2)/BALL_R;else if(s.age>=-.3)roll=-routes[i].travel.getLength()/BALL_R+(s.age>.6?routes[i].returning.getLength()*Math.min(1,(s.age-.6)/3.9)/BALL_R:0);balls[i].rotation.set(0,0,roll);const reacts=visible?visible(i,time-s.age):enabled[i];const parked=!enabled[i]&&!reacts;plates[i].rotation.x=(reacts?s.impact*.075:0)+(parked?.20:0);plates[i].position.y=routes[i].plate.y-(parked?.045:0);const m=targets[i].material as THREE.MeshPhysicalMaterial;m.color.set(enabled[i]?0xeee7d8:0x696f66);tines[i].rotation.z=reacts?s.impact*.14:0;}
 }
 function render(){renderer.render(scene,camera);if(software)gl.finish();}
 function reset(){controls.target.set(0,2,0);camera.position.copy(new THREE.Vector3().setFromSpherical(new THREE.Spherical(13.5,.95,.675)).add(controls.target));controls.update();}
 function getCamera():CameraState{const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));return [s.theta,s.phi,s.radius];}
 function setCamera(c:CameraState){camera.position.copy(new THREE.Vector3().setFromSpherical(new THREE.Spherical(c[2],c[1],c[0])).add(controls.target));controls.update();}
 function project(p:THREE.Vector3){const v=p.clone().project(camera);return {x:(v.x+1)*width/2,y:(1-v.y)*height/2};}
 function setQuality(q:string){quality=q;renderer.setPixelRatio(q==='low'?(software?.8:1):Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=q!=='low';resize();}
 const raycaster=new THREE.Raycaster();
 function wheelPoint(x:number,y:number){const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((x-rect.left)/width*2-1,1-(y-rect.top)/height*2),camera);return raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1),-WHEEL.z-1.15),new THREE.Vector3());}
 function wheelAngle(x:number,y:number){const p=wheelPoint(x,y);return p?Math.atan2(p.y-WHEEL.y,p.x-WHEEL.x):0;}
 function hit(x:number,y:number){const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((x-rect.left)/width*2-1,1-(y-rect.top)/height*2),camera);const notes=raycaster.intersectObjects(targets);const wheels=raycaster.intersectObject(wheel,true);if(notes.length&&(!wheels.length||notes[0].distance<wheels[0].distance))return {kind:'note',index:notes[0].object.userData.note as number};if(width<600){let best=18,index=-1;plates.forEach((plate,i)=>{const p=project(plate.position),d=Math.hypot(p.x-(x-rect.left),p.y-(y-rect.top));if(d<best){best=d;index=i;}});if(index>=0)return {kind:'note',index};}const wp=wheelPoint(x,y);if(wheels.length||(wp&&Math.hypot(wp.x-WHEEL.x,wp.y-WHEEL.y)<WHEEL_R+.12))return {kind:'wheel',index:-1};return {kind:'empty',index:-1};}
 function stats(){const gl=renderer.getContext();const debug=gl.getExtension('WEBGL_debug_renderer_info');return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,quality,renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};}
 return {renderer,scene,camera,controls,routes,plates,balls,wheel,targets,update,render,reset,getCamera,setCamera,project,hit,wheelAngle,stats,setQuality,resize};
}
