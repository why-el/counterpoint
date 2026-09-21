import {defaultScore,type ScoreConfig} from './score';
import type {CameraState} from './scene';
export type SharedState={v:1;s:ScoreConfig;c:CameraState};
export const DEFAULT_CAMERA:CameraState=[.675,.95,13.5];
export function readState(hash:string):SharedState|null{
 if(!hash||hash.length>900)return null;
 try{const x=JSON.parse(decodeURIComponent(hash.replace(/^#s=/,'')));
 if(x.v!==1||!x.s||!Array.isArray(x.s.mask)||x.s.mask.length!==8||!x.s.mask.every((b:unknown)=>typeof b==='boolean')||!Number.isInteger(x.s.variation)||x.s.variation<0||x.s.variation>2||!Number.isInteger(x.s.seed)||x.s.seed<0||x.s.seed>65535||!Array.isArray(x.c)||x.c.length!==3||!x.c.every((n:unknown)=>typeof n==='number'&&Number.isFinite(n)))return null;
 const c:CameraState=[Math.max(-Math.PI,Math.min(Math.PI,x.c[0])),Math.max(.30,Math.min(Math.PI*.49,x.c[1])),Math.max(7.7,Math.min(17,x.c[2]))];
 return {v:1,s:{mask:[...x.s.mask],variation:x.s.variation,seed:x.s.seed},c};
 }catch{return null;}
}
export function encodeState(score:ScoreConfig,camera:CameraState){return '#s='+encodeURIComponent(JSON.stringify({v:1,s:score,c:camera.map(n=>+n.toFixed(4))}));}
export function initialState(hash:string):SharedState{return readState(hash)||{v:1,s:defaultScore(),c:[...DEFAULT_CAMERA]};}
