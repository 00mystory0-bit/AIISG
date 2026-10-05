export interface VerificationEvidence { type:string; source:string; value:unknown; timestamp:string; }
export interface VerificationResult { verified:boolean; checks:string[]; evidence:VerificationEvidence[]; reason?:string; }

export class VerificationEngine {
  verifyTaskResult(result:unknown):VerificationResult {
    const evidence:VerificationEvidence[]=[];
    const timestamp=new Date().toISOString();
    const isRecord=typeof result==="object" && result!==null;
    const explicitSuccess=isRecord && (result as {ok?:unknown}).ok===true;
    if(isRecord) evidence.push({type:"result_shape",source:"task.result",value:true,timestamp});
    if(explicitSuccess) evidence.push({type:"explicit_success",source:"task.result.ok",value:true,timestamp});
    const verified=explicitSuccess;
    return {
      verified,
      checks:["result_shape","explicit_success"],
      evidence,
      ...(!verified?{reason:"Task result must explicitly report ok=true"}:{})
    };
  }
}
