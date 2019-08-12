"use strict";

import { app, protocol, BrowserWindow, shell } from "electron";
import { createProtocol, installVueDevtools } from "vue-cli-plugin-electron-builder/lib";
import * as path from "path";
import { fstat, existsSync } from "fs";

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(["app"], { secure: true });
function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({ width: 1600, height: 1000 });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
        //if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
        createProtocol("app");
        // Load the index.html when not in development
        win.loadURL("app://./index.html");
    }

    win.on("closed", () => {
        win = null;
    });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installVueDevtools();
        } catch (e) {
            console.error("Vue Devtools failed to install:", e.toString());
        }
    }
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", data => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}

//############################################################
//
// IPC services
//
//############################################################

const ipc = require("electron").ipcMain;

function find_assets(dir_name) {
    console.log('Looking for Assets in "' + dir_name + '"');
    let dir = dir_name;
    for (let i = 0; i < 4; i++) {
        let tpath = path.join(dir, "Assets");
        console.log('    checking for "' + tpath + '"');
        if (existsSync(tpath)) {
            console.log('   Found in "' + dir + '"');
            return tpath;
        }
        dir = path.dirname(dir);
    }
    return dir_name; // I give up
}

ipc.on("open-asset", (evt, arg) => {
    // The __dirname variable will be either
    //      "D:\Projects\Development\RPMSimulator\dist_electron"
    // or
    //      "C:\Users\wrhumph\AppData\Local\Programs\srls\resources\app.asar"
    console.log("ipc.on('open-file'): ", arg);
    console.log('__dirname is "' + __dirname + '"');
    let assets_dir = find_assets(__dirname);
    let filepath = path.join(assets_dir, arg);
    console.log('filepath is "' + filepath + '"');
    console.log("Opening " + filepath);
    shell.openItem(filepath);
});

ipc.on("devtools", evt => {
    win.webContents.openDevTools();
});
