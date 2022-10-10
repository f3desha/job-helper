var {remote} = require('electron');
const linkedinUserConfig = require('../../configs/user_linkedin_config.json');
const fs   = require('fs');
const {app} = require("@electron/remote");
const path = require('path');

const model = require('./Model');
const DS = new model();