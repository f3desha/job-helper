var {remote, ipcRenderer} = require('electron');


const fs   = require('fs');
const linkedinUserConfig = JSON.parse(fs.readFileSync('configs/user_linkedin_config.json'));

const fileHelperModule = require('../../modules/file-helper/FileHelper');
const fileHelper = new fileHelperModule();

const model = require('./Model');
const DS = new model();