const {ipcRenderer} = require('electron');
const HookServer = require("../../../backend/base/EventLayer/HookServer");

module.exports = class HookClient {
    constructor(){
        this.initialize();
    }

    initialize() {
        console.log('hook client init');
    }

    async invoke(eventSignature = 'my.custom.namespace:Sample:sendMessage') {
        //set handler
        let invoker = await ipcRenderer.invoke('event:createListener', eventSignature);
        let response = await ipcRenderer.invoke(eventSignature, '');
    }
}