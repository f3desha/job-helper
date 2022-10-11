// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron');

const remoteMain = require("@electron/remote/main");
remoteMain.initialize()

const ipcMain = require('electron').ipcMain;
const path = require('path')
const config = require('./config.json');
const userHelperModule = require('./modules/user-helper/UserHelper');
const userHelper = new userHelperModule();
const isMac = process.platform === 'darwin'
let mainMenu = null;


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
  createSubwindow(config.subwindows.linkedin_add_credentials_10102022);
}

function getLinkedinAddContacts(){
  createSubwindow(config.subwindows.linkedin_add_contacts_12052021);
}

function getAboutProgram(){
  createSubwindow(config.subwindows.about_program_10102022);
}

function createSubwindow(config){
   const subWindow = new BrowserWindow({
    resizable: false,
    width: config.width,
    height: config.height,
    show: config.show == false ? false : true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  remoteMain.enable(subWindow.webContents);
  subWindow.setIcon(path.join(__dirname, '/files/appicon.png'));
  subWindow.removeMenu();
  subWindow.loadFile(`./renderers/${config.id}/View.html`);
  // subWindow.webContents.openDevTools();
  return subWindow;
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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })

  // and load the index.html of the app.
  mainWindow.setIcon(path.join(__dirname, '/files/appicon.png'));
  mainWindow.loadFile('./index.html');
  mainWindow.maximize();

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
/*************LISTENERS END********* */