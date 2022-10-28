const {ipcMain} = require("electron");
const schema = require("../../app/EventLayer/hooks/my/custom/namespace/SampleHook");
module.exports = class HookServer {
    async createDynamicListener(eventSignature) {
        ipcMain.handleOnce(eventSignature, function(event1, args) {
            const parts = eventSignature.split(":");
            const pathParts = parts[0].split(".");
            const schema = require(`../../app/EventLayer/hooks/${pathParts.join('/')}/${parts[1]}Hook`);
            const instance = new schema();
            instance[parts[2]]();
        });
    }

}