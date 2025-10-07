// Has copy-pasted code from electron website and other sources so far for testing startup and build possibilities
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { registerUser, verifyUser } = require('./db');

let activeKey = null;
let activeUserId = null; // corresponds to Users.usersid
let mainWindow;
let loginWindow;

// Create login window
function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  loginWindow.loadFile(path.join(__dirname, 'views/login.html'));
}

// Create main app window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'views/index.html'));
}

// IPC: handle login
ipcMain.handle('attempt-login', async (event, username, password) => {
  return new Promise((resolve) => {
    verifyUser(username, password, (success, key, usersid) => {
      if (success) {
        activeKey = key;
        activeUserId = usersid;
        loginWindow.close();
        createMainWindow();
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
});

// IPC: handle register
ipcMain.handle('attempt-register', async (event, username, password) => {
  return new Promise((resolve) => {
    registerUser(username, password, (err, user) => {
      if (err) return resolve(false);
      activeKey = user.key;
      activeUserId = user.usersid;
      loginWindow.close();
      createMainWindow();
      resolve(true);
    });
  });
});

app.whenReady().then(createLoginWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
});
