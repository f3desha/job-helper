var {remote} = require('electron');
const {app} = require("@electron/remote");
const fs = require("fs");
var chromedriver = require('chromedriver');
var webdriver = require('selenium-webdriver');
const {By,until} = require('selenium-webdriver');
const userHelperModule = require('../../../modules/user-helper/UserHelper');
const userHelper = new userHelperModule();
const fileHelperModule = require('../../../modules/file-helper/FileHelper');
const fileHelper = new fileHelperModule(app);
const linkedinUserConfig = JSON.parse(fs.readFileSync(fileHelper.getPath('configs/user_linkedin_config.json')));


const model = require('./Model');
const DS = new model();