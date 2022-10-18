const fs = require("fs");
const fileHelperModule = require('../../modules/file-helper/FileHelper');

module.exports = class StorageBase {
    application = null;
    content = null;
    fileHelper = null;

    constructor(app) {
        this.application = app;
        this.initialize()
    }

    initialize(){
        this.fileHelper = new fileHelperModule();
        this.getContent();
    }

    get(objectName, key = '') {
        this.getContent();

        if (key) {
            return this.content[objectName][key];
        }
        return this.content[objectName];
    }

    set(objectName, key = '', value = ''){
        if (objectName) {
            if (key) {
                this.content[objectName][key] = value;
            } else {
                this.content[objectName] = value;
            }
        }

        fs.writeFileSync(
            this.fileHelper.getPath('modules/storage/storage.json'),
            JSON.stringify(this.content, null, "\t"), function (err) {
                if (err) {
                    return false;
                }
                else {
                    return this.content;
                }
            });
    }

    getContent() {
        this.content = JSON.parse(fs.readFileSync(this.fileHelper.getPath('modules/storage/storage.json')));
    }
}