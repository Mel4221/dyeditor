type EventPayloadMaping = 
{
    share:(obj:any)=>any;
}
type UnsubscribeFunction = ()=>void;
interface Window{
    electron:{
        share:(obj:any)=>any;
    }
}