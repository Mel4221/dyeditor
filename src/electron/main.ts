import { app, BrowserWindow } from 'electron';
import getPreload from './getPreload.js';
import { isDev, ipcMainHandle, getUIPath} from './utils.js';
import { createTray } from './createTray.js';
import { createMenu } from './menu.js';
import { processTalk } from './clownTalkHandle.js';
app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 1200,
        backgroundColor: 'white',
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false, 
            preload: getPreload()
        }
    });
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5123/");
    } else {
        mainWindow.loadFile(getUIPath());
    }


    ipcMainHandle('share', async (data?: any) => {
        if(isDev())console.log(data);
        return new Promise<any>(async (resolve)=>{
            resolve(await processTalk(data));
            
        });
    });


    createTray(mainWindow);
    handleCloseEvents(mainWindow);
    createMenu(mainWindow);
});


function handleCloseEvents(mainWindow: BrowserWindow) {

    return;
    let willClose = false;
    if (willClose) {
        return;
    }
    mainWindow.on('close', (e) => {
        e.preventDefault();
        mainWindow.hide();
        if (app.dock) {
            app.dock.hide();
        }
    });
    app.on('before-quit', () => {
        willClose = true;
    });
    mainWindow.on('show', () => {
        willClose = false;
    });
}