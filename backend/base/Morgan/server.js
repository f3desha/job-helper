const {ipcMain, app} = require("electron");
const path = require('path');

module.exports = class HookServer {
    async createDynamicListener(eventSignature) {
        ipcMain.handleOnce(eventSignature, function(event1, args) {
            const parts = eventSignature.split(":");
            const pathParts = parts[0].split(".");
            const schema = require(`${app.getAppPath()}${path.sep}backend${path.sep}app${path.sep}Morgan${path.sep}hooks${path.sep}${pathParts.join(path.sep)}/${parts[1]}Hook`);
            const instance = new schema();
            instance[parts[2]]();
        });
    }

}