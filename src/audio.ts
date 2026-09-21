import {NOTES,Score} from './score';
export const MASTER_GAIN=.8;
// Queue one cycle of the score, with one repeating strike per part.
// Native Web Audio scheduling keeps them on time during slow render frames.
export const AUDIO_LOOKAHEAD=24;
function compressor(ctx:BaseAudioContext){const node=ctx.createDynamicsCompressor();node.threshold.value=-16;node.knee.value=12;node.ratio.value=4;node.attack.value=.003;node.release.value=.25;node.connect(ctx.destination);return node;}
export function voice(ctx:BaseAudioContext,destination:AudioNode,note:number,at:number,velocity=1){
 const pitch=NOTES[note];const nodes:OscillatorNode[]=[];
 const partials=pitch.type===0?[[1,.50,2.2],[2.756,.15,.75],[5.404,.035,.25]]:pitch.type===1?[[1,.46,3.0],[2,.10,1.3],[4,.025,.4]]:[[1,.42,1.7],[1.997,.08,.55]];
 for(const [ratio,level,decay] of partials){
  const osc=ctx.createOscillator();const gain=ctx.createGain();osc.type='sine';osc.frequency.value=pitch.hz*ratio;
  const peak=level*.20*velocity;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(peak,at+.006);gain.gain.exponentialRampToValueAtTime(.00001,at+decay);gain.gain.linearRampToValueAtTime(0,at+decay+.03);
  osc.connect(gain).connect(destination);osc.start(at);osc.stop(at+decay+.04);osc.onended=()=>{osc.disconnect();gain.disconnect();};nodes.push(osc);
 }
 return nodes;
}
export class InstrumentAudio {
 context:AudioContext|null=null;private output:GainNode|null=null;private compressor:DynamicsCompressorNode|null=null;private voices:{nodes:OscillatorNode[];at:number;until:number}[]=[];enabled=false;starting=false;cursor=-Infinity;generation=0;scheduled:{id:string;time:number;generation:number}[]=[];
 async enable(){this.starting=true;let timer:ReturnType<typeof setTimeout>|undefined;
 try{if(!this.context){this.context=new AudioContext({latencyHint:'interactive'});this.compressor=compressor(this.context);}
 await Promise.race([this.context.resume(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Audio output did not start')),5000);})]);this.enabled=true;this.cancel();
 }finally{if(timer)clearTimeout(timer);this.starting=false;}}

 cancel(){this.generation++;this.cursor=-Infinity;if(!this.context)return;const now=this.context.currentTime;
 if(this.output){const old=this.output;old.gain.cancelScheduledValues(now);old.gain.setTargetAtTime(0,now,.008);setTimeout(()=>old.disconnect(),70);}
 for(const v of this.voices)for(const n of v.nodes)try{n.stop(now+.04);}catch{}
 this.voices=[];this.output=this.context.createGain();this.output.gain.setValueAtTime(0,now);this.output.gain.linearRampToValueAtTime(MASTER_GAIN,now+.018);this.output.connect(this.compressor!);
 }
 disable(){this.enabled=false;this.cancel();}
 schedule(score:Score,time:number,playing:boolean){
  if(!this.enabled||!playing||!this.context||this.context.state!=='running'||!this.output)return;
  const now=this.context.currentTime;
  // Do not queue a burst of historical strikes after stalls or hidden tabs.
  if(this.cursor<time-.05||this.cursor>time+AUDIO_LOOKAHEAD+.1)this.cursor=time-.001;
  const end=time+AUDIO_LOOKAHEAD;
  this.voices=this.voices.filter(v=>v.until>now);
  for(const e of score.events(this.cursor,end)){
   if(e.time<time-.015)continue;
   const at=now+Math.max(.003,e.time-time);
   if(this.voices.filter(v=>v.at<=at&&v.until>at).length>=8)continue;
   this.voices.push({nodes:voice(this.context,this.output,e.note,at),at,until:at+3.1});
   this.scheduled.push({id:e.id,time:e.time,generation:this.generation});if(this.scheduled.length>500)this.scheduled.shift();
  }
  this.cursor=end;
 }
 async offline(score:Score,duration=48){
  const ctx=new OfflineAudioContext(1,Math.ceil(duration*44100),44100);const out=ctx.createGain();out.gain.value=MASTER_GAIN;out.connect(compressor(ctx));
  for(const e of score.events(-.001,duration-3.2))voice(ctx,out,e.note,e.time+.01);
  const buffer=await ctx.startRendering();return buffer.getChannelData(0);
 }
}
