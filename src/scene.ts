import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { materials } from './materials';
import { makeRoute, sampleRoute,railCurve,WHEEL,WHEEL_R,BALL_R,TAU } from './routes';
export type CameraState = [number,number,number];
export function createSculpture(canvas:HTMLCanvasElement,count=1,alternate=0) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x18201e);scene.fog=new THREE.FogExp2(0x18201e,.028);
 const mat=materials(renderer);scene.environment=mat.env.texture;
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
 const floor=part(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:alternate===2?0xc6c2b5:0x0d1512,roughness:1}),[0,-.1,0],[-Math.PI/2,0,0],scene);floor.castShadow=false;
 part(new THREE.CylinderGeometry(3.5,3.64,.26,128),mat.stone,[0,.11,0]);
 part(new THREE.CylinderGeometry(3.51,3.51,.033,128),mat.bronze,[0,.264,0]);
 part(new THREE.CylinderGeometry(3.48,3.48,.075,128),mat.dark,[0,.306,0]);
 for(const radius of [3.28,3.32])part(new THREE.TorusGeometry(radius,.006,6,160),mat.brass,[0,.346,0],[Math.PI/2,0,0]);
 // Engraved clock divisions are repeated as a single instanced mesh.
 const ticks=new THREE.InstancedMesh(new THREE.BoxGeometry(.013,.005,.08),mat.brass,96); const dummy=new THREE.Object3D();
 for(let i=0;i<96;i++){const a=i/96*TAU;dummy.position.set(Math.cos(a)*3.12,.35,Math.sin(a)*3.12);dummy.rotation.set(0,-a+Math.PI/2,0);dummy.scale.set(1,1,i%8===0?1.7:.65);dummy.updateMatrix();ticks.setMatrixAt(i,dummy.matrix);}staticRoot.add(ticks);
 // Bearing pedestals and exposed axle.
 for(const z of [-.94,-.23]){
  part(new RoundedBoxGeometry(.28,1.94,.20,2,.055),mat.dark,[WHEEL.x,1.29,z]);
  part(new THREE.CylinderGeometry(.33,.36,.12,40),mat.brass,[WHEEL.x,.4,z]);
  part(new THREE.TorusGeometry(.23,.055,10,48),mat.brass,[WHEEL.x,WHEEL.y,z]);
 }
 rod(new THREE.Vector3(WHEEL.x,WHEEL.y,-1.11),new THREE.Vector3(WHEEL.x,WHEEL.y,.08),.10,mat.bronze);
 const wheel=new THREE.Group();wheel.position.copy(WHEEL);scene.add(wheel);
 for(const z of [-.15,.39]){
  part(new THREE.TorusGeometry(WHEEL_R,.078,12,128),mat.brass,[0,0,z],[0,0,0],wheel);
  part(new THREE.TorusGeometry(WHEEL_R-.18,.017,8,128),mat.edge,[0,0,z],[0,0,0],wheel);
  for(let i=0;i<8;i++){const a=i/8*TAU;const pts=[];for(let j=0;j<=20;j++){const u=j/20;const ang=a+(1-u)*.30;pts.push(new THREE.Vector3(Math.cos(ang)*(.25+u*(WHEEL_R-.27)),Math.sin(ang)*(.25+u*(WHEEL_R-.27)),z));}part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.038,8,false),mat.brass,[0,0,0],[0,0,0],wheel);}
 }
 for(let i=0;i<16;i++){const a=i/16*TAU;rod(new THREE.Vector3(Math.cos(a)*WHEEL_R,Math.sin(a)*WHEEL_R,-.15),new THREE.Vector3(Math.cos(a)*WHEEL_R,Math.sin(a)*WHEEL_R,.39),.03,mat.bronze,wheel);}
 part(new THREE.CylinderGeometry(.28,.28,.65,48),mat.brass,[0,0,.13],[Math.PI/2,0,0],wheel);
 part(new THREE.CylinderGeometry(.145,.145,.69,40),mat.ceramic,[0,0,.13],[Math.PI/2,0,0],wheel);
 part(new THREE.SphereGeometry(.1,20,12),mat.bronze,[0,0,.51],[0,0,0],wheel);
 // Small teeth identify the wheel as a manipulable mechanism.
 const teeth=new THREE.InstancedMesh(new THREE.BoxGeometry(.047,.085,.20),mat.bronze,80);
 for(let i=0;i<80;i++){const a=i/80*TAU;dummy.position.set(Math.cos(a)*(WHEEL_R+.064),Math.sin(a)*(WHEEL_R+.064),.11);dummy.rotation.set(0,0,a-Math.PI/2);dummy.scale.set(1,1,1);dummy.updateMatrix();teeth.setMatrixAt(i,dummy.matrix);}wheel.add(teeth);
 // An ivory gate conceals the resting marble magazine, never an exposed teleport.
 part(new RoundedBoxGeometry(.54,.42,.81,3,.12),mat.ceramic,[WHEEL.x,.52,-.40]);
 for(const z of [-.85,.05])part(new RoundedBoxGeometry(.64,.075,.055,2,.02),mat.brass,[WHEEL.x,.49,z]);
 const routes=Array.from({length:count},(_,i)=>makeRoute(i));
 const plates:THREE.Group[]=[];const targets:THREE.Mesh[]=[];const balls:THREE.Mesh[]=[];const gates:THREE.Mesh[]=[];
 for(const r of routes){
  for(const path of [r.travel,r.returning]){
   for(const side of [-1,1])part(new THREE.TubeGeometry(railCurve(path,side),160,.017,6,false),mat.brass);
   for(let j=1;j<10;j++){const t=j/10;const p=path.getPointAt(t);const v=path.getTangentAt(t);const n=new THREE.Vector3(-v.z,0,v.x).normalize();const a=p.clone().addScaledVector(n,-.085);a.y-=.11;const b=p.clone().addScaledVector(n,.085);b.y-=.11;rod(a,b,.012,mat.bronze);}
  }
  // Slender struts explain the suspended rails without filling the negative space.
  if(r.index%2===0){for(const t of [.25,.63]){const p=r.travel.getPointAt(t);p.y-=.13;rod(new THREE.Vector3(p.x,.35,p.z),p,.022,mat.bronze);part(new THREE.CylinderGeometry(.08,.12,.055,16),mat.brass,[p.x,.375,p.z]);}}
  const plateGroup=new THREE.Group();plateGroup.position.copy(r.plate);scene.add(plateGroup);plates.push(plateGroup);
  const ceramic=mat.ceramic.clone();const plate=part(new RoundedBoxGeometry(.48,.09,.78,4,.043),ceramic,[0,0,0],[0,-.16+r.index*.16,0],plateGroup);plate.userData.note=r.index;targets.push(plate);
  for(const dx of [-.15,.15]){
   rod(new THREE.Vector3(r.plate.x+dx,.35,r.plate.z),new THREE.Vector3(r.plate.x+dx,r.plate.y-.10,r.plate.z),.022,mat.brass);
   part(new THREE.SphereGeometry(.044,12,8),mat.bronze,[r.plate.x+dx,r.plate.y-.075,r.plate.z]);
  }
  part(new RoundedBoxGeometry(.34,.065,.18,2,.025),mat.bronze,r.plate.clone().add(new THREE.Vector3(0,-.14,0)));
  const gate=part(new THREE.BoxGeometry(.20,.045,.03),mat.edge,r.travel.getPointAt(.98).add(new THREE.Vector3(0,.07,0)),[0,0,0],scene);gates.push(gate);
  const ball=part(new THREE.SphereGeometry(BALL_R,24,16),mat.ceramic,[0,0,0],[0,0,0],scene);balls.push(ball);
  // A fine equator makes rolling direction legible up close.
  const stripe=new THREE.Mesh(new THREE.TorusGeometry(BALL_R+.0005,.002,4,32),mat.bronze);ball.add(stripe);
 }
 // Merge fixed components by material to keep the intricate assembly inexpensive.
 staticRoot.updateMatrixWorld(true);
 const remove:THREE.Object3D[]=[];
 staticRoot.traverse(o=>{if(o instanceof THREE.Mesh&&!(o instanceof THREE.InstancedMesh)){const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld);const attr=g.attributes;for(const k of Object.keys(attr))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);if(!staticGeos.has(o.material as THREE.Material))staticGeos.set(o.material as THREE.Material,[]);staticGeos.get(o.material as THREE.Material)!.push(g);remove.push(o);}});
 for(const obj of remove)staticRoot.remove(obj);
 for(const [m,gs] of staticGeos){const g=mergeGeometries(gs,false);if(g){const mesh=new THREE.Mesh(g,m);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);}for(const geo of gs)geo.dispose();}
 let width=1,height=1;let quality='high';
 function resize(){width=canvas.clientWidth;height=canvas.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=width<600?48:36;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 function update(time:number,enabled:boolean[]=Array(8).fill(true),visible?:(index:number,eventTime:number)=>boolean){
  wheel.rotation.z=-time*TAU/12;
  for(let i=0;i<routes.length;i++){const s=sampleRoute(routes[i],time);balls[i].position.copy(s.position);balls[i].visible=s.visible&&(visible?visible(i,time-s.age):enabled[i]);balls[i].rotation.set(time*.48,0,-(s.age+13.5)*4.8);const reacts=visible?visible(i,time-s.age):enabled[i];plates[i].rotation.x=reacts?s.impact*.052:0;plates[i].position.y=routes[i].plate.y-(enabled[i]?0:.045);const m=targets[i].material as THREE.MeshPhysicalMaterial;m.color.set(enabled[i]?0xeee7d8:0x696f66);gates[i].rotation.z=reacts&&s.age>-.38&&s.age<.25?Math.sin((s.age+.38)*Math.PI/.63)*.8:0;}
 }
 function render(){renderer.render(scene,camera);}
 function reset(){camera.position.set(8,6.4,10);controls.target.set(0,2,0);controls.update();render();}
 function getCamera():CameraState{const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));return [s.theta,s.phi,s.radius];}
 function setCamera(c:CameraState){camera.position.copy(new THREE.Vector3().setFromSpherical(new THREE.Spherical(c[2],c[1],c[0])).add(controls.target));controls.update();render();}
 function project(p:THREE.Vector3){const v=p.clone().project(camera);return {x:(v.x+1)*width/2,y:(1-v.y)*height/2};}
 function setQuality(q:string){quality=q;renderer.setPixelRatio(q==='low'?1:Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=q!=='low';resize();}
 const raycaster=new THREE.Raycaster();
 function hit(x:number,y:number){const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((x-rect.left)/width*2-1,1-(y-rect.top)/height*2),camera);const notes=raycaster.intersectObjects(targets);const wheels=raycaster.intersectObject(wheel,true);if(notes.length&&(!wheels.length||notes[0].distance<wheels[0].distance))return {kind:'note',index:notes[0].object.userData.note as number};if(wheels.length)return {kind:'wheel',index:-1};return {kind:'empty',index:-1};}
 function stats(){const gl=renderer.getContext();const debug=gl.getExtension('WEBGL_debug_renderer_info');return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,quality,renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};}
 return {renderer,scene,camera,controls,routes,plates,balls,wheel,targets,update,render,reset,getCamera,setCamera,project,hit,stats,setQuality,resize};
}
