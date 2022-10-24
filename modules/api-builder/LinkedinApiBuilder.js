var webdriver = require('selenium-webdriver');
const {By,until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

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
}