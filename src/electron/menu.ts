import { Menu ,app,BrowserWindow} from "electron";
import { isDev } from "./utils.js";

export function createMenu(mainWindow:BrowserWindow)
{
    Menu.setApplicationMenu(
        Menu.buildFromTemplate([
            {
                label:"App",
                type:"submenu",
                submenu:
                [
                    {
                        label:"exit",
                        click:()=>app.exit()
                    },
                    {
                        label:"DevTools",
                        click:()=>mainWindow.webContents.openDevTools(),
                        visible:isDev(),
                    }
                ]
            }
        ])
    )
}