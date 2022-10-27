const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = 2402
const linkedinApiBuilderModule = require("../api-builder/LinkedinApiBuilder");
const linkedinApiBuilder = new linkedinApiBuilderModule();

module.exports = class LinkedinApiWrapper {
    server = null;

    async build() {
        await linkedinApiBuilder.init();
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(bodyParser.raw());

        app.get('/linkedin-api-v1/test', async (req, res) => {
            res.json({
                'response': 'It Works!'
            })
        })

        app.post('/linkedin-api-v1/account/login', async (req, res) => {
            const username = req.body.username;
            const password = req.body.password;

            const result = await linkedinApiBuilder.login(username, password);

            res.json({
                'status': result
            })
        })

        app.post('/linkedin-api-v1/account/mfa-check', async (req, res) => {
            const mfaCode = req.body.mfaCode;
            const result = await linkedinApiBuilder.mfaCheck(mfaCode);

            res.json({
                'status': result
            })
        })

        app.get('/linkedin-api-v1/account/get-my-linkedin-urn-id', async (req, res) => {

            const result = await linkedinApiBuilder.getMyLinkedinUrnId();

            res.json({
                'status': result
            })
        })

        app.get('/linkedin-api-v1/account/get-people-from-search/invitable/:searchKeyword/:page', async (req, res) => {
            const result = await linkedinApiBuilder.getInvitablePeopleFromSearch(req.params.searchKeyword, req.params.page);

            res.json({
                'response': result
            })
        })

        app.get('/linkedin-api-v1/account/mynetwork/contacts-get-links', async (req, res) => {
            const result = await linkedinApiBuilder.getAllContacts();

            res.json({
                'response': `imported ${result} links`
            })
        })

        app.get('/linkedin-api-v1/account/mynetwork/get-all-contacts-summary', async (req, res) => {
            const result = await linkedinApiBuilder.getAllContactsSummary();

            res.json({
                'response': result.contactsNumber ?? null
            })
        })

        app.get('/linkedin-api-v1/account/mynetwork/get-invites-sent-summary', async (req, res) => {
            // const result = await linkedinApiBuilder.getAllContactsSummary();

            res.json({
                'response': 477
            })
        })

        app.get('/linkedin-api-v1/account/mynetwork/contacts-get-profiles', async (req, res) => {
            const result = await linkedinApiBuilder.getProfileByLink();

            res.json({
                'response': result
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

    isOnline() {
        return linkedinApiBuilder.isOnline();
    }
}