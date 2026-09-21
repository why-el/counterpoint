import * as THREE from 'three';
export const TAU = Math.PI*2;
export const CYCLE = 24;
export const BALL_R = .095;
export const WHEEL = new THREE.Vector3(-1.65, 2.38, -.62);
export const WHEEL_R = 1.78;
export const mod = (a:number,b:number)=>((a%b)+b)%b;
export const ease=(t:number)=>t*t*(3-2*t);
export interface Route { index:number; offset:number; z:number; top:THREE.Vector3; bottom:THREE.Vector3; plate:THREE.Vector3; travel:THREE.CatmullRomCurve3; returning:THREE.CatmullRomCurve3; }
export function makeRoute(index:number):Route {
  const z = WHEEL.z+.06+index*.046;
  const top = new THREE.Vector3(WHEEL.x, WHEEL.y+WHEEL_R,z);
  const bottom = new THREE.Vector3(WHEEL.x,WHEEL.y-WHEEL_R,z);
  const a = -.10+index*.225;
  const radius=2.24-index*.11;
  const plate = new THREE.Vector3(Math.cos(a)*radius, .92 + index*.063, Math.sin(a)*radius+.40);
  const release = plate.clone().add(new THREE.Vector3(-.05,.44,-.08));
  const travel = new THREE.CatmullRomCurve3([
    top,
    new THREE.Vector3(-.70,4.10-index*.038,-1.16-index*.078),
    new THREE.Vector3(1.24+index*.035,3.54-index*.103,-1.72+index*.070),
    new THREE.Vector3(2.65-index*.088,2.54-index*.073,-.89+index*.082),
    new THREE.Vector3(2.82-index*.095,1.76+index*.016,.12+index*.067),
    release
  ],false,'centripetal');
  const returning = new THREE.CatmullRomCurve3([
    plate.clone().add(new THREE.Vector3(-.16, .13, .30)),
    new THREE.Vector3(plate.x-.4,.69,plate.z+.55),
    new THREE.Vector3(.10-index*.07,.50,1.53-index*.08),
    new THREE.Vector3(-1.38,.48,.76-index*.045),
    bottom
  ],false,'centripetal');
  return {index,offset:index*3,z,top,bottom,plate,travel,returning};
}
export function sampleRoute(r:Route,t:number): {position:THREE.Vector3; stage:string; age:number; visible:boolean; impact:number} {
  const age=mod(t-r.offset+13.5,CYCLE)-13.5;
  let p:THREE.Vector3; let stage:string;
  if(age < -7.5) {
    const u=(age+13.5)/6; const angle=-Math.PI/2-Math.PI*u;
    p=new THREE.Vector3(WHEEL.x+WHEEL_R*Math.cos(angle),WHEEL.y+WHEEL_R*Math.sin(angle),r.z);stage='lift';
  } else if(age<-.30) {
    const u=(age+7.5)/7.2;
    p=r.travel.getPointAt(u);stage='rail';
  } else if(age<0) {
    const u=(age+.30)/.30;
    p=r.travel.getPointAt(1).lerp(r.plate.clone().add(new THREE.Vector3(0,BALL_R+.045,0)),u*u);stage='drop';
  } else if(age<.60) {
    const u=age/.60; const hit=r.plate.clone().add(new THREE.Vector3(0,BALL_R+.045,0));
    p=hit.lerp(r.returning.getPointAt(0),u);p.y+=Math.sin(Math.PI*u)*.25;stage='catch';
  } else if(age<4.5) {
    p=r.returning.getPointAt((age-.6)/3.9);stage='return';
  } else { p=r.bottom.clone();stage='rest'; }
  const impact= age>=0&&age<.85 ? Math.sin(age*57)*Math.exp(-age*6):0;
  return {position:p,stage,age,visible:stage!=='rest',impact};
}
export function railCurve(curve:THREE.Curve<THREE.Vector3>,side:number):THREE.CatmullRomCurve3 {
 const pts:THREE.Vector3[]=[];
 for(let i=0;i<=144;i++){ const t=i/144;const p=curve.getPointAt(t);const tangent=curve.getTangentAt(t);const normal=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();p.addScaledVector(normal,side*.061);p.y-=.087;pts.push(p); }
 return new THREE.CatmullRomCurve3(pts);
}
