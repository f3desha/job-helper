var {remote, ipcRenderer} = require('electron');
const linkedinUserConfig = require('../../configs/user_linkedin_config.json');
const fs   = require('fs');
const fileHelperModule = require('../../modules/file-helper/FileHelper');
const fileHelper = new fileHelperModule();

const model = require('./Model');
const DS = new model();