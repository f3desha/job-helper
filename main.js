// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, session, dialog, MenuItem} = require('electron');
const remoteMain = require("@electron/remote/main");
remoteMain.initialize()

const ipcMain = require('electron').ipcMain;
const path = require('path')
const config = require('./config.json');
const https = require('https');
const fs   = require('fs');
const isMac = process.platform === 'darwin'
let applicationUser = null;
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
    label: 'Menu',
    submenu: [
      {
        label: 'Add Contacts',
        accelerator: process.platform === 'darwin' ? 'Alt+A' : 'Alt+A',
        click (item, focusedWindow) {
        if (focusedWindow) getAddContacts();
       }
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
    ]
  }
]
mainMenu = Menu.buildFromTemplate(template);
/*******MENU TEMPLATE ENDS*****************/

/***********FUNCTIONS******** */

function getAddContacts(){
  createSubwindow(config.subwindows.add_contacts_12052021);
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

ipcMain.on('oauth-link-received', function(event1, args) {
  const subWindow = new BrowserWindow({
    frame: false,
    minWidth: 700,
    minHeight: 700,
    width: 700,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });
  subWindow.removeMenu();
  subWindow.loadURL(args.url);
  subWindow.webContents.on('did-redirect-navigation', function (event2, newUrl) {
    var urlParams = new URLSearchParams(newUrl);
      /////////////////////////
    if(urlParams.has('https://thawing-bastion-45853.herokuapp.com/api/v1/callback?code')){
      subWindow.webContents.executeJavaScript(`function gethtml () {
        return new Promise((resolve, reject) => { resolve(document.getElementById('access_token').innerHTML); });
        }
        gethtml();`).then((html) => {

          const cookie = { url: 'https://www.linkedin.com', name: 'auth_token', value: html }
          session.defaultSession.cookies.set(cookie)
          .then(() => {
            session.defaultSession.cookies.get({name: 'auth_token', domain: 'www.linkedin.com'})
            .then((cookies) => {
              let tempToken = cookies[0].value;
              event1.sender.send('token-received',true);
              mainWindow.webContents.send('profile-update',tempToken);
              subWindow.close();
              userLoggedIn();
            }).catch((error) => {
              console.log(error)
            })
          }, (error) => {
            console.error(error)
          })

      })
      ////////////////////////

    }

    // More complex code to handle tokens goes here
});
});

ipcMain.on('user-init', (event, obj) => {

  applicationUser = {
    id: 'session_user_object',
    firstName: obj.firstName,
    lastName: obj.lastName,
    linkedin_id: obj.user_id,
    avatarPath: './files/images/avatars/'+obj.user_id+'.jpg',
    auth_token: obj.auth_token
  };
  console.log(applicationUser);

  download(obj.url, obj.user_id+'.jpg').then(function(data){
    mainWindow.webContents.send('avatar-uploaded',obj);
  });
});
/*************LISTENERS END********* */