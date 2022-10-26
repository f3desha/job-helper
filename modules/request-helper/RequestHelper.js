const { net } = require('electron');

module.exports = class RequestHelper {

    async getRequest(url){
        return await new Promise(function(resolve, reject) {
            const request = net.request(url);
            request.on('response', (response) => {

                response.on('data', (chunk) => {
                    return resolve(chunk);
                })

                response.on('end', () => {

                })
            })
            request.setHeader('Content-Type', 'application/json');
            request.end();
        });
    }

    async postRequest(url, body = {}){
        return await new Promise(function(resolve, reject) {
            body = JSON.stringify(body);
            const request = net.request({
                method: 'POST',
                url: url,
                redirect: 'follow'
            });
            request.on('response', (response) => {

                response.on('data', (chunk) => {
                    return resolve(chunk);
                })

                response.on('end', () => {

                })
            })
            request.setHeader('Content-Type', 'application/json');
            request.write(body, 'utf-8');
            request.end();
        });
    }
}