module.exports = class Linkedin {
    async oauthCodeCaller(){
        return await new Promise(function(resolve, reject) {
            const { net } = require('electron').remote;
            const request = net.request('https://thawing-bastion-45853.herokuapp.com/api/v1/authorization')
            request.on('response', (response) => {
               
                response.on('data', (chunk) => {
                    chunk = JSON.parse(chunk);
                    return resolve(chunk);
                })

                response.on('end', () => {

                })
            })
            request.end()
         });
    }

    async oauthProfileCaller(token){
        return await new Promise(function(resolve, reject) {
            const { net } = require('electron').remote;
            const request = net.request('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))&oauth2_access_token='+token)
            request.on('response', (response) => {
               
                response.on('data', (chunk) => {
                    chunk = JSON.parse(chunk);
                    return resolve(chunk);
                })

                response.on('end', () => {

                })
            })
            request.end()
         });
    }
}