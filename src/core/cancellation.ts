export class CancellationRegistry{
 private readonly controllers=new Map<string,AbortController>();
 create(taskId:string){const c=new AbortController();this.controllers.set(taskId,c);return c.signal;}
 cancel(taskId:string){const c=this.controllers.get(taskId);if(!c)return false;c.abort();return true;}
 remove(taskId:string){this.controllers.delete(taskId);}
 isCancelled(taskId:string){return this.controllers.get(taskId)?.signal.aborted??false;}
}
