var {remote, ipcRenderer} = require('electron');
const {app} = require("@electron/remote");

const fs   = require('fs');
const fileHelperModule = require('../../../modules/file-helper/FileHelper');
const fileHelper = new fileHelperModule(app);
const linkedinUserConfig = JSON.parse(fs.readFileSync(fileHelper.getPath('configs/user_linkedin_config.json')));

const model = require('./Model');
const DS = new model();