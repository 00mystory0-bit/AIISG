export class EmergencyStop {
 private stopped=false; private reason?:string; private stoppedAt?:string;
 activate(reason="Emergency stop activated"){this.stopped=true;this.reason=reason;this.stoppedAt=new Date().toISOString();}
 reset(){this.stopped=false;this.reason=undefined;this.stoppedAt=undefined;}
 isActive(){return this.stopped;}
 assertRunning(){if(this.stopped)throw new Error("AIISG emergency stop active: "+this.reason);}
 status(){return {active:this.stopped,reason:this.reason,stoppedAt:this.stoppedAt};}
}
