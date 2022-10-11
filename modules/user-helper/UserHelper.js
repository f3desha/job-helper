const fs = require('fs');

module.exports = class UserHelper {
    isLogined(){
        let buffer = fs.readFileSync('configs/user_linkedin_config.json');
        const linkedinUserConfig = JSON.parse(buffer);

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