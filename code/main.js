const {app,BrowserWindow} = require("electron");
const path = require("path");

function createWindow(){

    const mainWindow = new BrowserWindow({

        width:1400,
        height:1000,

        webPreferences:{
            nodeIntegration:true,

            contextIsolation:false

        }
    });

    mainWindow.loadFile(path.join(__dirname, "views", "login.html"));

}

app.whenReady().then(()=>{

    createWindow();

});

app.on("window-all-closed",()=>{

    if(process.platform!=="darwin"){

        app.quit();

    }

});