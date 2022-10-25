var webdriver = require('selenium-webdriver');
const {By,until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const userHelperModule = require('../user-helper/UserHelper');
const userHelper = new userHelperModule();
const StorageBase = require('../storage/StorageBase');
const Storage = new StorageBase();

module.exports = class LinkedinApiBuilder {
    driver = null;

    isOnline() {
        if (this.driver) {
            return true;
        }
        return false;
    }

    async checkDriverHealth() {
            return new Promise((resolve, reject) => {
                if (this.driver) {
                    this.driver.getWindowHandle()
                    .then(async (response) => {
                        resolve('driverLive');
                    }) .catch((err) => {
                    reject('driverDead');
                });
            } else {
                    reject('driverNotInitialized');
                }
        })

    }

    async init(){
        try {


        this.driver = new webdriver.Builder()
            .forBrowser('chrome')
            // .setChromeOptions(
            //     new chrome.Options().headless()
            // )
            .build();


            await this.driver.get('https://www.linkedin.com');
            this.driver.manage().window().maximize();
            return 'success';
        } finally {}
    }

    async login(login, password){
        return new Promise(async (resolve, reject) => {

                await this.driver.sleep(1000);
                let LinkedinLogin = this.driver.findElement(By.id('session_key'));
                LinkedinLogin.sendKeys(login);
                let LinkedinPassword = this.driver.findElement(By.id('session_password'));
                LinkedinPassword.sendKeys(password);
                await this.driver.sleep(1000);
                let loginButton = this.driver.findElement(By.css('button.sign-in-form__submit-button'));
                loginButton.click();
                await this.driver.sleep(2000);

                this.driver.wait(until.elementLocated(By.css('div[id="error-for-password"]')), 10000)
                    .then(async () => {
                        resolve('loginFailed');
                    }, function (error) {

                    });
                this.driver.wait(until.elementLocated(By.css('input[name="pin"]')), 10000)
                    .then(async () => {
                        resolve('waitForMfa');
                    }, function (error) {

                    });
                this.driver.wait(until.elementLocated(By.css('main[id="main"]')), 10000)
                    .then(async () => {
                        resolve('loginSuccessfull');
                    }, function (error) {

                    });

        })
    }

    async logout() {
        if (this.driver) {
            this.driver.quit();
        }
        this.driver = null;
        return true;
    }

    async mfaCheck (mfaCode){
        return new Promise(async (resolve, reject) => {

            let mfaInput = await this.driver.findElement(By.css('input[name="pin"]'));
            mfaInput.sendKeys(mfaCode);
            this.driver.sleep(1000);
            let sendButton = this.driver.findElement(By.id('two-step-submit-button'));
            sendButton.click();

            this.driver.wait(until.elementLocated(By.css('main[id="main"]')), 10000)
                .then(async () => {
                    resolve('loginSuccessfull');
                }, function (error) {

                });

        })
    }

    async scrollToBottom() {
        return new Promise((resolve, reject) => {
            let scrollToBottom = setInterval(() => {
                this.driver.wait(until.elementLocated(By.css('button.scaffold-finite-scroll__load-button')), 6000)
                    .then(async () => {
                        let moreButton = await this.driver.findElement(By.css('button.scaffold-finite-scroll__load-button'));
                        moreButton.click();
                        console.log('Pressed');
                    }, function (error) {
                        console.log('Bottom of page reached');
                        clearInterval(scrollToBottom);
                        resolve(true);
                    });
            }, 2000);
        })
    }

    async getProfileByLink() {
        const originalWindow = await this.driver.getWindowHandle();
        await this.driver.get(`https://www.linkedin.com/in/max-liashuk-aa040824b/`);
        await this.driver.executeScript('window.open("https://www.linkedin.com/in/max-liashuk-aa040824b/");');
        await this.driver.executeScript('window.open("https://www.linkedin.com/in/max-liashuk-aa040824b/");');
        await this.driver.executeScript('window.open("https://www.linkedin.com/in/max-liashuk-aa040824b/");');
        await this.driver.executeScript('window.open("https://www.linkedin.com/in/max-liashuk-aa040824b/");');
        await this.driver.executeScript('window.open("https://www.linkedin.com/in/max-liashuk-aa040824b/");');

        const windows = await this.driver.getAllWindowHandles();
        windows.forEach(async handle => {
            if (handle !== originalWindow) {
                await this.driver.switchTo().window(handle);
            }
        });
        // let person = {};
        // let urnidElement = await this.driver.findElement(By.css('section.artdeco-card.ember-view.pv-top-card'));
        // let urnid = await urnidElement.getAttribute('data-member-id');
        // person.profileLink = 'https://www.linkedin.com/in/max-liashuk-aa040824b/';
        // let photoElement = await this.driver.findElement(By.css('img.pv-top-card-profile-picture__image.pv-top-card-profile-picture__image--show.ember-view'));
        // person.profilePhoto = await photoElement.getAttribute('src');
        // let nameElement = await this.driver.findElement(By.css('h1.text-heading-xlarge.inline.t-24.v-align-middle.break-words'));
        // person.profileName = await nameElement.getText();

        return 1;
    }

    async getAllContacts() {
        await this.driver.get(`https://www.linkedin.com/mynetwork/invite-connect/connections/`);
        await this.driver.sleep(3000);

        await this.scrollToBottom();
        console.log('Content loaded');
        let contactsList = Storage.get('contactsListProfileLinks');
        let allContacts = await this.driver.findElements(By.css('li.mn-connection-card.artdeco-list'));
        let key = null;
        let i = null;
        for (i = 0; i < allContacts.length; i++) {

            let mainBlock = await allContacts[i].findElement(By.css("a.ember-view.mn-connection-card__picture"));
            key = await mainBlock.getAttribute("href");
            contactsList[key] = i;
            console.log(`[${i}] Setting ${key}`);

        }
        Storage.set('contactsListProfileLinks', '', contactsList);
        return i;
    }

    async getInvitablePeopleFromSearch(searchKeyword = '', page = 1) {
        await this.driver.get(`https://www.linkedin.com/search/results/people/?keywords=${searchKeyword}&origin=SWITCH_SEARCH_VERTICAL&page=${page}&sid=`+userHelper.generateRandomString(3));
        await this.driver.sleep(5000);
        let buttonsContainer = await this.driver.findElements(By.css(".ph0.pv2.artdeco-card.mb2 ul.reusable-search__entity-result-list.list-style-none li div.entity-result__actions.entity-result__divider div button[aria-label^='Пригласить участника']"));
        let collection = [];
        for (let i = 0; i < buttonsContainer.length; i++) {
            let person = {};
            let button = buttonsContainer[i];
            let parent1 = await button.findElement(By.xpath("./.."));
            let parent2 = await parent1.findElement(By.xpath("./.."));
            let parent3 = await parent2.findElement(By.xpath("./.."));
            let parent4 = await parent3.findElement(By.xpath("./.."));
            let a = await parent4.findElement(By.css("a.app-aware-link"));
            let profileLink = await a.getAttribute("href");
            let b = await parent4.findElement(By.css("img.presence-entity__image"));

            let profileImage = await b.getAttribute("src");
            let profileName = await b.getAttribute("alt");
            person.profileName = profileName;
            person.profileLink = profileLink;
            person.profileImage = profileImage;

            collection.push(person);
        }
        return collection;

    }
}