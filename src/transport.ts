/** One transport; switching clocks preserves the exact transport instant. */
export class Transport {
 private anchorTime:number; private anchorClock:number; playing:boolean; private clock:()=>number;
 constructor(clock:()=>number,time=0,playing=true){this.clock=clock;this.anchorClock=clock();this.anchorTime=time;this.playing=playing;}
 read(){return this.anchorTime+(this.playing?Math.max(0,this.clock()-this.anchorClock):0);}
 seek(time:number){if(!Number.isFinite(time))return;this.anchorTime=time;this.anchorClock=this.clock();}
 pause(){this.seek(this.read());this.playing=false;}
 play(){this.anchorClock=this.clock();this.playing=true;}
 useClock(clock:()=>number){const t=this.read();this.clock=clock;this.anchorTime=t;this.anchorClock=clock();}
}
