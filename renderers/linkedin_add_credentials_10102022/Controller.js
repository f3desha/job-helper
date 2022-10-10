var {remote} = require('electron');
const linkedinUserConfig = require('../../configs/user_linkedin_config.json');
const fs   = require('fs');

const model = require('./Model');
const DS = new model();