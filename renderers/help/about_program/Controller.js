var {remote} = require('electron');
const programConfig = require('../../../package.json');
const HookClient = require('../../../frontend/base/EventLayer/HookClient');
const HookClientInstance = new HookClient();

const model = require('./Model');
const DS = new model();