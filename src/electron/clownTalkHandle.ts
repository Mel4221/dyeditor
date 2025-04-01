import { rejects } from "assert";
import { error } from "console";
import { stat } from "fs";
import { resolve } from "path";

const invalid_method =
    {
        status:'FAIL',
        message:'INVALID clownTalk COMUNICATION METHODFAIL',
    }


export function processTalk(obj:any):Promise<any>
{
    return new Promise<any>(async (resolve)=>
    {
        let data = 
        {
            status:'OK',
            message:{}
        }
         if(typeof obj !== 'object' || obj === null)
         {
                  resolve(invalid_method);
            return;
         }
         
         switch(obj.type)
         {
            /*
                here is where you add your comunications types
            */
            case 'test':
                data.message = {
                    info:'message received and working...',
                    received:obj
                }
                break;
            default:
                resolve(invalid_method);
                return;

         }
         resolve(data);
       
       
    });
}