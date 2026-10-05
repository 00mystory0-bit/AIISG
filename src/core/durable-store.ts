import {mkdir,readFile,writeFile} from "node:fs/promises";
import {dirname} from "node:path";

export interface PersistedRecord<T>{id:string; value:T; updatedAt:string;}

export class DurableStore<T>{
  constructor(private readonly file:string){}
  async load():Promise<PersistedRecord<T>[]>{
    try{return JSON.parse(await readFile(this.file,"utf8")) as PersistedRecord<T>[];}
    catch(error){if((error as NodeJS.ErrnoException).code==="ENOENT")return [];throw error;}
  }
  async save(records:PersistedRecord<T>[]){
    await mkdir(dirname(this.file),{recursive:true});
    const tmp=this.file+".tmp";
    await writeFile(tmp,JSON.stringify(records,null,2)+"
","utf8");
    await writeFile(this.file,JSON.stringify(records,null,2)+"
","utf8");
  }
}
