import {CYCLE,mod,PHASES} from './routes';
export const NOTES=[{name:'D3',hz:146.832,type:0},{name:'A3',hz:220,type:1},{name:'D4',hz:293.665,type:0},{name:'E4',hz:329.628,type:2},{name:'F4',hz:349.228,type:1},{name:'A4',hz:440,type:0},{name:'C5',hz:523.251,type:2},{name:'E5',hz:659.255,type:1}];
export const OFFSETS=PHASES;
export const VARIATIONS=['Stillwater','Interlace','Afterglow'];
export type ScoreConfig={mask:boolean[];variation:number;seed:number};
export type Revision={at:number;config:ScoreConfig};
export type Strike={id:string;time:number;note:number};
export const defaultScore=():ScoreConfig=>({mask:Array(8).fill(true),variation:0,seed:37});
const copy=(c:ScoreConfig):ScoreConfig=>({...c,mask:[...c.mask]});
export class Score {
 revisions:Revision[];
 constructor(initial=defaultScore()){this.revisions=[{at:-1e12,config:copy(initial)}];}
 at(t:number):ScoreConfig{for(let i=this.revisions.length-1;i>=0;i--)if(this.revisions[i].at<=t)return this.revisions[i].config;return this.revisions[0].config;}
 desired(){return copy(this.revisions[this.revisions.length-1].config);}
 queue(config:ScoreConfig,t:number){const at=(Math.floor(t/3)+1)*3;this.revisions=this.revisions.filter(r=>r.at<at);this.revisions.push({at,config:copy(config)});return at;}
 audible(note:number,eventTime:number){
  // A score is latched when a pocket starts lifting. Every in-flight ball finishes.
  const c=this.at(eventTime-13.5);if(!c.mask[note])return false;
  const turn=Math.floor((eventTime-OFFSETS[note])/CYCLE);
  if(c.variation===0)return !([3,7].includes(note)&&mod(turn+c.seed,2)===0);
  if(c.variation===1)return !(note===0&&mod(turn,2)===1);
  return [0,2,5,6].includes(note)||(mod(turn+c.seed,3)===0&&[1,7].includes(note));
 }
 events(from:number,to:number):Strike[]{
  if(!Number.isFinite(from)||!Number.isFinite(to)||to<=from||to-from>1000)return [];
  const events:Strike[]=[];
  for(let note=0;note<8;note++){const first=Math.floor((from-OFFSETS[note])/CYCLE)+1;const last=Math.floor((to-OFFSETS[note])/CYCLE);for(let k=first;k<=last;k++){const time=OFFSETS[note]+k*CYCLE;if(this.audible(note,time))events.push({id:`${note}:${k}`,time,note});}}
  return events.sort((a,b)=>a.time-b.time||a.note-b.note);
 }
}
