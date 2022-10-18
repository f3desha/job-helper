var {remote, ipcRenderer} = require('electron');
const StorageBase = require('../../../modules/storage/StorageBase');
const Storage = new StorageBase();
const linkedinUserConfig = Storage.get('linkedinTasks');

const model = require('./Model');
const DS = new model();