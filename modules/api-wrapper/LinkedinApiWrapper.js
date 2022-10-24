const express = require('express')
const app = express()
const port = 2402
const linkedinApiBuilderModule = require("../api-builder/LinkedinApiBuilder");
const linkedinApiBuilder = new linkedinApiBuilderModule();

module.exports = class LinkedinApiWrapper {
    server = null;

    async build() {
        await linkedinApiBuilder.init();

        app.get('/', async (req, res) => {
            res.json({
                'hello': 'world'
            })
        })

        this.server = app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })

    }

    close() {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    }

    async start() {
        await this.build();
    }

    async stop() {
        this.close();
        await linkedinApiBuilder.logout();
    }

    async checkDriverHealth() {
        return await linkedinApiBuilder.checkDriverHealth();
    }
}