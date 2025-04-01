import {app} from 'electron';

import path from 'path'
import { isDev } from './utils.js'

export default function getPreload()
{
    return path.join(
        app.getAppPath(),
        isDev()?'.':'..',
        '/dist-electron/preload.cjs'

    )
}