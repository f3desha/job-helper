// Modules to control application life and create native browser window

const { app, BrowserWindow, Menu, dialog, net } = require('electron');
const { autoUpdater } = require('electron-updater');
const remoteMain = require("@electron/remote/main");
remoteMain.initialize()
const ipcMain = require('electron').ipcMain;

const fs = require("fs");
const path = require('path');

const HookServer = require('./backend/base/EventLayer/HookServer');
const HookServerInstance = new HookServer();
ipcMain.handle('event:createListener', async (event1, eventSignature) => {
  return await HookServerInstance.createDynamicListener(eventSignature);
});

appInit();

const linkedinApiWrapperModule = require("./modules/api-wrapper/LinkedinApiWrapper");
const linkedinApiWrapper = new linkedinApiWrapperModule();
const requestHelperModule = require("./modules/request-helper/RequestHelper");
const requestHelper = new requestHelperModule();
const userHelperModule = require('./modules/user-helper/UserHelper');
const userHelper = new userHelperModule(linkedinApiWrapper);
const isMac = process.platform === 'darwin'
let mainMenu = null;


const config = require('./config.json');
const schema = require("./backend/app/EventLayer/hooks/my/custom/namespace/SampleHook");

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
            accelerator: process.platform === 'darwin' ? 'Alt+L' : 'Alt+L',
            click (item, focusedWindow) {
              if (focusedWindow) getLinkedinConnectionStatus();
            }
          },
          {
            id: 'linkedin-connection-status',
            label: 'Connection Status',
            accelerator: process.platform === 'darwin' ? 'Alt+L' : 'Alt+L',
            click (item, focusedWindow) {
              if (focusedWindow) getLinkedinConnectionStatus();
            }
          },
          {
            id: 'find-for-invite',
            label: 'Find for Invite...',
            click (item, focusedWindow) {
              if (focusedWindow) getFindForInvite();
            }
          },
          {
            id: 'send-invite',
            label: 'Send Invite',
            click (item, focusedWindow) {
               if (focusedWindow) getSendLinkedinInvite();
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

function getLinkedinConnectionStatus(){
  createSubwindow(config.subwindows.linkedin_tasks.connection_status);
}

function getFindForInvite(){
  createSubwindow(config.subwindows.linkedin_tasks.find_for_invite);
}

function  getSendLinkedinInvite(){
  createSubwindow(config.subwindows.linkedin_tasks.send_invite);
}

function getAboutProgram(){
  createSubwindow(config.subwindows.help.about_program);
}

function createLinkedinapiDemon(){
  linkedinApiWrapper.start();
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

async function appInit() {
  if (!fs.existsSync(app.getAppPath() + path.sep + 'config.json')) {
    fs.copyFileSync(app.getAppPath() + path.sep + 'config.init.json', app.getAppPath() + path.sep + 'config.json');
  }
  if (!fs.existsSync(app.getAppPath() + path.sep + 'modules'+ path.sep +'storage'+ path.sep +'storage.json')) {
    fs.copyFileSync(app.getAppPath() + path.sep + 'modules'+ path.sep +'storage'+ path.sep +'storage.init.json', app.getAppPath() + path.sep + 'modules'+ path.sep +'storage'+ path.sep +'storage.json');
  }

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
  mainMenu.getMenuItemById('linkedin-connection-status').visible = userHelper.isLogined();
  mainMenu.getMenuItemById('find-for-invite').enabled = userHelper.isLogined();
  mainMenu.getMenuItemById('send-invite').enabled = userHelper.isLogined();
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

  mainWindow.on('close', async () => {
    await linkedinApiWrapper.stop();
  })
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

  setInterval(() => {
      linkedinApiWrapper.checkDriverHealth()
          .then(async (response) => {

          }) .catch((err) => {
            if (err === 'driverDead') {
              linkedinApiWrapper.stop();
              refreshMainMenu();
            }
      });
  }, 30000);
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
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') app.quit()
})



ipcMain.on('login-event', function(event1, args) {
    refreshMainMenu();
});

ipcMain.handle('create-linkedinapi-demon', async (event1, args) => {
  return await linkedinApiWrapper.start();
});

ipcMain.handle('linkedinapi-login', async (event1, args) => {
  let response = await requestHelper.postRequest('http://localhost:2402/linkedin-api-v1/account/login', { username: args.login, password: args.password });
  let res = JSON.parse(response);
  return res.status;
});

ipcMain.handle('linkedinapi-mfa-check', async (event1, mfaCode) => {
    let response = await requestHelper.postRequest('http://localhost:2402/linkedin-api-v1/account/mfa-check', {'mfaCode': mfaCode});
    let res = JSON.parse(response);
    return res.status;
});

ipcMain.handle('get-invitable-people', async (event1, page) => {
  let response = await requestHelper.getRequest(`http://localhost:2402/linkedin-api-v1/account/get-people-from-search/invitable/HR/${page}`);
  let res = JSON.parse(response);

  let obj = {};
  res.response.forEach(element => {
    obj[element['profileLink']] = {
      "name": element['profileName'],
      "image": element['profileImage']
    }
  });

  return JSON.stringify(obj);
});

ipcMain.handle('get-linkedin-urn-id', async (event1, mfaCode) => {
  let response = await requestHelper.getRequest('http://localhost:2402/linkedin-api-v1/account/get-my-linkedin-urn-id');
  let res = JSON.parse(response);
  return res.status;
});

ipcMain.handle('check-invites-sent', async (event1, arg) => {
  let response = await requestHelper.getRequest('http://localhost:2402/linkedin-api-v1/account/mynetwork/get-invites-sent-summary');
  let res = JSON.parse(response);
  return res.response;
});


ipcMain.handle('get-all-contacts-summary', async (event1, arg) => {
  let response = await requestHelper.getRequest('http://localhost:2402/linkedin-api-v1/account/mynetwork/get-all-contacts-summary');
  let res = JSON.parse(response);
  return res.response;
});

ipcMain.handle('get-all-contacts-import', async (event1, arg) => {
  let response = await requestHelper.getRequest('http://localhost:2402/linkedin-api-v1/account/mynetwork/contacts-get-links');
  let res = JSON.parse(response);
  return res.response;
});

ipcMain.handle('check-linkedinapi-status', (event1, args) => {
  return linkedinApiWrapper.isOnline();
});

ipcMain.handle('linkedinapi-stop', (event1, args) => {
  return linkedinApiWrapper.stop();
});

ipcMain.handle('linkedinapi-cancel-action', (event1, args) => {
  return linkedinApiWrapper.goToMain();
});

ipcMain.handle('send-linkedin-invitation', async (event1, args) => {
  console.log(args);
  let response = await requestHelper.postRequest('http://localhost:2402/linkedin-api-v1/account/mynetwork/add-invite',
      {'message': args.message, 'profileLink': args.profileLink});
  let res = JSON.parse(response);
  return res.status;
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