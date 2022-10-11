var {remote} = require('electron');
const linkedinUserConfig = require('../../configs/user_linkedin_config.json');
var chromedriver = require('chromedriver');
var webdriver = require('selenium-webdriver');
const {By,until} = require('selenium-webdriver');
const userHelperModule = require('../../modules/user-helper/UserHelper');
const userHelper = new userHelperModule();

const model = require('./Model');
const DS = new model();