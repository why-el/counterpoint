import {makeRoute,railCurve,BALL_R} from '../src/routes';
const rs=Array.from({length:8},(_,i)=>makeRoute(i));const rails=rs.map(r=>[-1,1].map(s=>railCurve(r.travel,s).getPoints(300)).flat());
for(const r of rs){let min=99,worst='';let near=0;for(let k=0;k<=160;k++){const p=r.travel.getPointAt(k/160);for(let j=0;j<8;j++){if(r.index===j)continue;for(const q of rails[j]){const d=p.distanceTo(q);if(d<min){min=d;worst=`t=${(k/160).toFixed(2)} against ${j}`;}if(d<BALL_R+.017)near++;}}}console.log(r.index,{min:+min.toFixed(3),worst,near});}
