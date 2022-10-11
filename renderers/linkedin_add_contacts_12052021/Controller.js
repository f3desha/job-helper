var {remote} = require('electron');
const fs = require("fs");
const linkedinUserConfig = JSON.parse(fs.readFileSync('configs/user_linkedin_config.json'));
var chromedriver = require('chromedriver');
var webdriver = require('selenium-webdriver');
const {By,until} = require('selenium-webdriver');
const userHelperModule = require('../../modules/user-helper/UserHelper');
const userHelper = new userHelperModule();
const fileHelperModule = require('../../modules/file-helper/FileHelper');
const fileHelper = new fileHelperModule();

const model = require('./Model');
const DS = new model();