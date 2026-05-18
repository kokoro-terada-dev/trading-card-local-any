import { BrowserWindow, app } from "electron";
import path from "path";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1800,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadURL("http://localhost:5173");
};

app.whenReady().then(createWindow);