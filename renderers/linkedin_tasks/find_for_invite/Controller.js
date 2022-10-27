var {remote, ipcRenderer} = require('electron');
const fs = require("fs");
var chromedriver = require('chromedriver');
var webdriver = require('selenium-webdriver');
const {By,until} = require('selenium-webdriver');
const userHelperModule = require('../../../modules/user-helper/UserHelper');
const userHelper = new userHelperModule();
const StorageBase = require('../../../modules/storage/StorageBase');
const Storage = new StorageBase();
let linkedinUserConfig = Storage.get('linkedinTasks');


const model = require('./Model');
const DS = new model();