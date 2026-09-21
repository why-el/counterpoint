import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
export function materials(renderer:THREE.WebGLRenderer) {
 const pmrem=new THREE.PMREMGenerator(renderer); const room=new RoomEnvironment();
 const env=pmrem.fromScene(room,.05); room.dispose();pmrem.dispose();
 const w=128,h=128,data=new Uint8Array(w*h*4);
 let seed=87; const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let y=0;y<h;y++){const stripe=rand()*18;for(let x=0;x<w;x++){const k=(y*w+x)*4;const n=105+stripe+rand()*8;data[k]=data[k+1]=data[k+2]=n;data[k+3]=255;}}
 const brush=new THREE.DataTexture(data,w,h);brush.wrapS=brush.wrapT=THREE.RepeatWrapping;brush.repeat.set(1,3);brush.needsUpdate=true;
 const stoneNoise=new Uint8Array(128*128*4);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const k=(y*128+x)*4;const v=160+Math.sin(x*.17+y*.08)*12+Math.sin(x*.04-y*.10)*10+rand()*28;stoneNoise[k]=stoneNoise[k+1]=stoneNoise[k+2]=v;stoneNoise[k+3]=255;}const stoneTexture=new THREE.DataTexture(stoneNoise,128,128);stoneTexture.wrapS=stoneTexture.wrapT=THREE.RepeatWrapping;stoneTexture.repeat.set(4,4);stoneTexture.needsUpdate=true;
 return {env,
  brass:new THREE.MeshStandardMaterial({color:0xc6a46a,metalness:1,roughness:.38,roughnessMap:brush,envMapIntensity:1.1}),
  edge:new THREE.MeshStandardMaterial({color:0xe0c391,metalness:.84,roughness:.22,envMapIntensity:1.2}),
  bronze:new THREE.MeshStandardMaterial({color:0x655039,metalness:.83,roughness:.4}),
  ceramic:new THREE.MeshPhysicalMaterial({color:0xeee7d8,roughness:.26,metalness:0,clearcoat:.3,clearcoatRoughness:.22}),
  dark:new THREE.MeshStandardMaterial({color:0x1b2828,roughness:.64,metalness:.18}),
  stone:new THREE.MeshStandardMaterial({color:0x121c18,roughness:.84,metalness:.12,bumpMap:stoneTexture,bumpScale:.027}),
  inlay:new THREE.MeshStandardMaterial({color:0x758078,roughness:.85}),
  black:new THREE.MeshStandardMaterial({color:0x15201d,roughness:.55,metalness:.35})
 };
}
