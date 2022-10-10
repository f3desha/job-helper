var {remote} = require('electron');
var chromedriver = require('chromedriver');
var webdriver = require('selenium-webdriver');
const {By,until} = require('selenium-webdriver');


const model = require('./Model');
const DS = new model();