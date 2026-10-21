export type SoundMode='off'|'sunny'|'coastal'|'groove';
export interface SoundSettings {mode:SoundMode;ambience:number;music:number;effects:number;}
export const defaultSound:SoundSettings={mode:'off',ambience:25,music:15,effects:30};
export function parseSound(value:unknown):SoundSettings{
 const p=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const volume=(key:string,fallback:number)=>typeof p[key]==='number'&&Number.isFinite(p[key])?Math.min(100,Math.max(0,p[key] as number)):fallback;
 return {mode:['off','sunny','coastal','groove'].includes(String(p.mode))?p.mode as SoundMode:'off',ambience:volume('ambience',25),music:volume('music',15),effects:volume('effects',30)};
}
/** Owns every node and interval. One context per explorer; no audio asset requests. */
export class SoundEngine {
 private context?:AudioContext;
 private timer?:ReturnType<typeof setInterval>;
 private nodes=new Set<AudioScheduledSourceNode>();
 private wind?:GainNode;
 private revision=0;
 private disposed=false;
 private settings=defaultSound;
 constructor(private factory=()=>new AudioContext()){}
 update(settings:SoundSettings){this.settings=settings;const ctx=this.context;if(this.wind&&ctx)this.wind.gain.setTargetAtTime(settings.ambience/100*.045,ctx.currentTime,.15);}
 private tone(frequency:number,duration:number,volume:number,type:OscillatorType='sine'){
  const ctx=this.context;if(!ctx||ctx.state!=='running'||!volume)return;
  const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type=type;oscillator.frequency.value=frequency;
  gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(volume*.10,ctx.currentTime+.025);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
  oscillator.connect(gain);gain.connect(ctx.destination);this.nodes.add(oscillator);oscillator.onended=()=>{this.nodes.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start();oscillator.stop(ctx.currentTime+duration+.02);
 }
 async start(){
  this.stop();if(this.disposed||this.settings.mode==='off')return false;
  const ticket=this.revision,ctx=this.context??=this.factory();await ctx.resume();
  if(ticket!==this.revision||this.disposed||ctx.state!=='running')return false;
  // Soft filtered noise gives coast/wind a continuous texture rather than a repeated beep.
  const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=this.settings.mode==='coastal'?350:700;gain.gain.value=this.settings.ambience/100*.045;
  source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);this.wind=gain;this.nodes.add(source);source.onended=()=>{this.nodes.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start();
  let beat=0;this.timer=setInterval(()=>{const s=this.settings,b=beat++;if(this.wind)this.wind.gain.setTargetAtTime(s.ambience/100*.045*(.7+.3*Math.sin(b/4)),ctx.currentTime,.3);
   if(s.mode==='groove')this.tone([220,261.63,329.63,392,329.63,261.63][b%6],.5,s.music/100,'triangle');
   else if(b%4===0)this.tone(s.mode==='coastal'?440:523.25,1.2,s.music/100*.4,'triangle');
  },600);return true;
 }
 cue(){this.tone(659.25,.16,this.settings.effects/100);}
 stop(){this.revision++;if(this.timer)clearInterval(this.timer);this.timer=undefined;for(const source of this.nodes){try{source.stop();}catch{/* Already ended. */}}this.nodes.clear();this.wind=undefined;if(this.context?.state==='running')void this.context.suspend().catch(()=>{});}
 dispose(){this.disposed=true;this.stop();void this.context?.close().catch(()=>{});}
}
