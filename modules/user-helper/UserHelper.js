

module.exports = class UserHelper {

    isLogined(){
        const StorageBase = require('../../modules/storage/StorageBase');
        const Storage = new StorageBase();
        const linkedinUserConfig = Storage.get('linkedinTasks');
        return linkedinUserConfig.login !== '' && linkedinUserConfig.password !== '';
    }

    generateRandomString(length) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz()*'.split('');

        if (! length) {
            length = Math.floor(Math.random() * chars.length);
        }

        var str = '';
        for (var i = 0; i < length; i++) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    }
}