const fs = require('fs');

module.exports = class UserHelper {
    isLogined(){
        let buffer = fs.readFileSync('configs/user_linkedin_config.json');
        const linkedinUserConfig = JSON.parse(buffer);

        return linkedinUserConfig.login !== '' && linkedinUserConfig.password !== '';
    }
}