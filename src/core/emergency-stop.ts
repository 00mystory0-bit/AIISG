export class EmergencyStop {
 private stopped=false; private reason?:string; private stoppedAt?:string; private listeners=new Set<()=>void>();
 activate(reason="Emergency stop activated"){this.stopped=true;this.reason=reason;this.stoppedAt=new Date().toISOString();for(const listener of this.listeners)listener();}
 reset(){this.stopped=false;this.reason=undefined;this.stoppedAt=undefined;}
 onActivate(listener:()=>void){this.listeners.add(listener);return ()=>this.listeners.delete(listener);}
 isActive(){return this.stopped;}
 assertRunning(){if(this.stopped)throw new Error("AIISG emergency stop active: "+this.reason);}
 status(){return {active:this.stopped,reason:this.reason,stoppedAt:this.stoppedAt};}
}
