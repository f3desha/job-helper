// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const remoteMain = require("@electron/remote/main");
remoteMain.initialize()
const ipcMain = require('electron').ipcMain;
const fs = require("fs");
const path = require('path');
const userHelperModule = require('./modules/user-helper/UserHelper');
const userHelper = new userHelperModule();
const isMac = process.platform === 'darwin'
let mainMenu = null;

appInit();

const config = require('./config.json');


/********MENU TEMPLATE START *************** */
const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : {
          role: 'quit',
          accelerator: process.platform === 'darwin' ? 'Alt+Q' : 'Alt+Q'
      },
    ]
  },
  {
    label: 'Tasks',
    submenu: [
      {
        label: 'LinkedIn',
        submenu: [
          {
            id: 'linkedin-login',
            label: 'Login...',
            click (item, focusedWindow) {
              if (focusedWindow) getLinkedinAddCredentials();
            }
          },
          {
            id: 'linkedin-credentials',
            label: 'Credentials',
            click (item, focusedWindow) {
              if (focusedWindow) getLinkedinAddCredentials();
            }
          },
          {
            id: 'linkedin-add-contacts',
            label: 'Add Contacts',
            accelerator: process.platform === 'darwin' ? 'Alt+A' : 'Alt+A',
            click (item, focusedWindow) {
              if (focusedWindow) getLinkedinAddContacts();
            }
          }
        ]
      },
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click (item, focusedWindow) {
          if (focusedWindow) getAboutProgram();
        }
      },
    ]
  },
  // {
  //   label: 'View',
  //   submenu: [
  //     { role: 'reload' },
  //     { role: 'forceReload' },
  //     { role: 'toggleDevTools' },
  //   ]
  // }
]
mainMenu = Menu.buildFromTemplate(template);
/*******MENU TEMPLATE ENDS*****************/

/***********FUNCTIONS******** */

function getLinkedinAddCredentials(){
  createSubwindow(config.subwindows.linkedin_tasks.add_credentials);
}

function getLinkedinAddContacts(){
  createSubwindow(config.subwindows.linkedin_tasks.add_contacts);
}

function getAboutProgram(){
  createSubwindow(config.subwindows.help.about_program);
}

function createSubwindow(config){
   const subWindow = new BrowserWindow({
    resizable: false,
    width: config.width,
    height: config.height,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  remoteMain.enable(subWindow.webContents);
  subWindow.setIcon(path.join(__dirname, '/files/icon.png'));
  subWindow.removeMenu();
  subWindow.loadFile(`./renderers/${config.group}/${config.id}/View.html`);
  // subWindow.webContents.openDevTools();
  subWindow.once('ready-to-show', () => {
    subWindow.show()
  });
  return subWindow;
}

function appInit() {
  fs.copyFileSync(app.getAppPath() + path.sep + 'config.init.json', app.getAppPath() + path.sep + 'config.json');
  fs.copyFileSync(app.getAppPath() + path.sep + 'modules'+ path.sep +'storage'+ path.sep +'storage.init.json', app.getAppPath() + path.sep + 'modules'+ path.sep +'storage'+ path.sep +'storage.json');

  const config = require('./config.json');
  config.appPath = app.getAppPath();
  fs.writeFileSync(
      app.getAppPath() + path.sep + 'config.json',
      JSON.stringify(config, null, "\t"), function (err) {
        if (err) {

        }
        else {

        }
      });
}

function createMainMenu(){
  Menu.setApplicationMenu(mainMenu)
}

function refreshMainMenu(){
  mainMenu.getMenuItemById('linkedin-login').visible = !userHelper.isLogined();
  mainMenu.getMenuItemById('linkedin-credentials').visible = userHelper.isLogined();
  mainMenu.getMenuItemById('linkedin-add-contacts').enabled = userHelper.isLogined();
}

function createMainWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 1280,
    minHeight: 720,
    width: 1280,
    height: 720,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })

  // and load the index.html of the app.
  mainWindow.setIcon(path.join(__dirname, '/files/icon.png'));
  mainWindow.loadFile('./index.html');
  mainWindow.maximize();
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    autoUpdater.checkForUpdates();

  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

/**********FUNCTIONS END***************** */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createMainMenu()
  refreshMainMenu()
  createMainWindow()

  // app.on('activate', function () {
  //   // On macOS it's common to re-create a window in the app when the
  //   // dock icon is clicked and there are no other windows open.
  //   if (BrowserWindow.getAllWindows().length === 0) createWindow()
  // })

})



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.



/*************LISTENERS ************ */
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('login-event', function(event1, args) {
    refreshMainMenu();
});

autoUpdater.on('update-available', (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Ok'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: "A new version is being downloaded."
  }
  dialog.showMessageBox(dialogOpts, (response) => {

  });
});

autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart','Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: "A new version has been downloaded. Restart the application to apply the updates."
  };
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});
/*************LISTENERS END********* */