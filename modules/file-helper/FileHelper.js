const path = require('path');
const config = require('../../config.json');

module.exports = class FileHelper {
    constructor() {
    }

    getPath(p){
        let parts = p.split('/');
        return config.appPath + path.sep+parts.join(path.sep);
    }
}