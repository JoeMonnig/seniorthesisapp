const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('secureAPI', {
  attemptLogin: (username, password) => ipcRenderer.invoke('attempt-login', username, password),
  attemptRegister: (username, password) => ipcRenderer.invoke('attempt-register', username, password),
  getUserInfo: () => ipcRenderer.invoke('get-user-info')
});
