const path = require('path');

module.exports = class FileHelper {
    application = null;

    constructor(app) {
        this.application = app;
    }

    getPath(p){
        let parts = p.split('/');
        return this.application.getAppPath()+path.sep+parts.join(path.sep);
    }
}