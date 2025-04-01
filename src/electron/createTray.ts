import { BrowserWindow ,Tray,Menu,app} from "electron";



export function createTray(mainWindow: BrowserWindow)
{
       const tray = new Tray(
            "src/electron/assets/icon.png"
            /*
            path.join(getAssetPath(),
            process.platform === 'darwin' ? 'setting.png':'setting.png'
            
        )
        */);
        tray.setContextMenu(Menu.buildFromTemplate([
        {
            label:"show",
            click:()=>{
                mainWindow.show();
                if(app.dock){
                    app.dock.show();
                }
            }
        },
        {
            label:"close",
            click:()=>app.quit()
        }
        ]));
}