import { ipcMain, WebContents ,app,WebFrameMain} from "electron";
import path from 'path'
import { pathToFileURL } from "url";


export function isDev(): boolean
{
    return process.env.NODE_ENV === 'development';
}

export function ipcMainHandle<Key extends keyof EventPayloadMaping>(
    key: Key,
    handle: (data?: any) => Promise<EventPayloadMaping[Key]>
) {
    ipcMain.handle(key, async (event, data?: any) => {
        // @ts-ignore
        validateEventFrame(event.senderFrame); 
        return handle(data); 
    });
}



export function ipcWebContentSend<Key extends keyof EventPayloadMaping>(
    key:Key,
    webContents: WebContents,
    payload:EventPayloadMaping[Key]
){
    webContents.send(key,payload);
}


export function getUIPath()
{
    return path.join(app.getAppPath(),'/dist-react/index.html');
}

export function validateEventFrame(frame: WebFrameMain)
{
    if(isDev()&& new URL(frame.url).host ==='localhost:5123')
    {
        return;
    }
    if(frame.url !== pathToFileURL(getUIPath()).toString())
    {
        throw new Error('Something Malicius is happening');
    }
}

export function getAssetPath(){
    return path.join(app.getAppPath(),isDev()?'.':'...','/src/assets');
}
 