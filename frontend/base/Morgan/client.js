const {ipcRenderer} = require('electron');
const HookServer = require("../../../backend/base/Morgan/server");

module.exports = class HookClient {

    async invoke(eventSignature = 'my.custom.namespace:Sample:sendMessage') {
        //set handler
        let invoker = await ipcRenderer.invoke('event:createListener', eventSignature);
        let response = await ipcRenderer.invoke(eventSignature, '');
    }
}