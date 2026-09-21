import {NOTES,Score,type Strike} from './score';
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
 context:AudioContext|null=null;private output:GainNode|null=null;private compressor:DynamicsCompressorNode|null=null;private voices:{nodes:OscillatorNode[];until:number}[]=[];enabled=false;cursor=-Infinity;generation=0;scheduled:{id:string;time:number;generation:number}[]=[];
 async enable(){if(!this.context){this.context=new AudioContext({latencyHint:'interactive'});this.compressor=this.context.createDynamicsCompressor();this.compressor.threshold.value=-16;this.compressor.knee.value=12;this.compressor.ratio.value=4;this.compressor.attack.value=.003;this.compressor.release.value=.25;this.compressor.connect(this.context.destination);}
 await this.context.resume();this.enabled=true;this.cancel();}
 cancel(){this.generation++;this.cursor=-Infinity;if(!this.context)return;const now=this.context.currentTime;
 if(this.output){const old=this.output;old.gain.cancelScheduledValues(now);old.gain.setTargetAtTime(0,now,.008);setTimeout(()=>old.disconnect(),70);}
 for(const v of this.voices)for(const n of v.nodes)try{n.stop(now+.04);}catch{}
 this.voices=[];this.output=this.context.createGain();this.output.gain.setValueAtTime(0,now);this.output.gain.linearRampToValueAtTime(.45,now+.018);this.output.connect(this.compressor!);
 }
 disable(){this.enabled=false;this.cancel();}
 schedule(score:Score,time:number,playing:boolean){
  if(!this.enabled||!playing||!this.context||this.context.state!=='running'||!this.output)return;
  const now=this.context.currentTime;
  // Do not queue a burst of historical strikes after stalls or hidden tabs.
  if(this.cursor<time-.05||this.cursor>time+.2)this.cursor=time-.001;
  const end=time+.14;
  for(const e of score.events(this.cursor,end)){
   if(e.time<time-.015)continue;
   this.voices=this.voices.filter(v=>v.until>now);
   if(this.voices.length>=8)continue;
   const at=now+Math.max(.003,e.time-time);this.voices.push({nodes:voice(this.context,this.output,e.note,at),until:at+3.1});
   this.scheduled.push({id:e.id,time:e.time,generation:this.generation});if(this.scheduled.length>500)this.scheduled.shift();
  }
  this.cursor=end;
 }
 async offline(score:Score,duration=48){
  const ctx=new OfflineAudioContext(1,Math.ceil(duration*44100),44100);const out=ctx.createGain();out.gain.value=.45;out.connect(ctx.destination);
  for(const e of score.events(-.001,duration-3.2))voice(ctx,out,e.note,e.time+.01);
  const buffer=await ctx.startRendering();return buffer.getChannelData(0);
 }
}
