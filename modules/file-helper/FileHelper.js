const {app} = require("@electron/remote");
const path = require('path');

module.exports = class FileHelper {
    getPath(p){
        let parts = p.split('/');
        return app.getAppPath()+path.sep+parts.join(path.sep);
    }
}