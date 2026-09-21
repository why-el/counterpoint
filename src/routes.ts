import * as THREE from 'three';
export const TAU = Math.PI*2;
export const CYCLE = 24;
export const PHASES=[0,4.5,6,10.5,13.5,15,19.5,21];
export const railProgress=(u:number)=>.25*u+.75*Math.pow(u,1.65);
export const BALL_R = .095;
export const WHEEL = new THREE.Vector3(-1.65, 2.38, 0);
export const WHEEL_R = 1.78;
export const mod = (a:number,b:number)=>((a%b)+b)%b;
export const ease=(t:number)=>t*t*(3-2*t);
export interface Route { index:number; offset:number; z:number; top:THREE.Vector3; bottom:THREE.Vector3; plate:THREE.Vector3; travel:THREE.CatmullRomCurve3; returning:THREE.CatmullRomCurve3; }
export function makeRoute(index:number):Route {
  const z=-.91+index*.26;
  const top = new THREE.Vector3(WHEEL.x, WHEEL.y+WHEEL_R,z);
  const bottom = new THREE.Vector3(WHEEL.x,WHEEL.y-WHEEL_R,z);
  const plate = new THREE.Vector3(2.30-.025*(index-3.5)**2,.96+.04*Math.cos(index*.5),z);
  const release = plate.clone().add(new THREE.Vector3(-.05,.44,0));
  const travel = new THREE.CatmullRomCurve3([
    top,
    new THREE.Vector3(-.70,4.13,z),
    new THREE.Vector3(.83,3.71-index*.027,z),
    new THREE.Vector3(plate.x-.50,2.93-index*.028,z),
    new THREE.Vector3(plate.x-.14,2.00,z),
    release
  ],false,'centripetal');
  const returning = new THREE.CatmullRomCurve3([
    plate.clone().add(new THREE.Vector3(-.53,.17,0)),
    new THREE.Vector3(plate.x-.83,.66,z),
    new THREE.Vector3(.05,.47,z),
    new THREE.Vector3(-1.15,.51,z),
    bottom
  ],false,'centripetal');
  return {index,offset:PHASES[index],z,top,bottom,plate,travel,returning};
}
export function sampleRoute(r:Route,t:number): {position:THREE.Vector3; stage:string; age:number; visible:boolean; impact:number} {
  const age=mod(t-r.offset+13.5,CYCLE)-13.5;
  let p:THREE.Vector3; let stage:string;
  if(age < -7.5) {
    const u=(age+13.5)/6; const angle=-Math.PI/2-Math.PI*u;
    p=new THREE.Vector3(WHEEL.x+WHEEL_R*Math.cos(angle),WHEEL.y+WHEEL_R*Math.sin(angle),r.z);stage='lift';
  } else if(age<-.30) {
    const u=(age+7.5)/7.2;
    p=r.travel.getPointAt(railProgress(u));stage='rail';
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
 for(let i=0;i<=144;i++){ const t=i/144;const p=curve.getPointAt(t);const tangent=curve.getTangentAt(t);const lateral=new THREE.Vector3(0,0,1);const down=new THREE.Vector3().crossVectors(tangent,lateral).normalize();if(down.y>0)down.negate();p.addScaledVector(lateral,side*.061).addScaledVector(down,.094);pts.push(p); }
 return new THREE.CatmullRomCurve3(pts);
}
