const BaseModel = require("../../../modules/Base/BaseModel");

module.exports = class Model extends BaseModel {
    constructor(){
        super();

        const DS = this;

        //Defining elements location
        this.windowElements = {
            buttons: {
                start:    {
                    location: document.getElementById("start")
                },
                close:  {
                    location: document.getElementById("close")
                },
            },
            spans: {
                validation_bar: {
                    location: document.querySelector('#validation-bar-span')
                },
                searchFor: {
                    location: document.querySelector('#search-for')
                },
                startFromPage: {
                    location: document.querySelector('#start-from-page')
                },
            },
        };

        this.windowElements.spans.startFromPage.init = () => {
            const startSearchPageNum = linkedinUserConfig.startSearchPageNumber;
            DS.get('spans','startFromPage').value = startSearchPageNum;
        }

        this.windowElements.spans.searchFor.init = () => {
            const defaultSearchKeyword = linkedinUserConfig.addContactsDefaultSearchKeyword;
            DS.get('spans','searchFor').value = defaultSearchKeyword;
        }
    
        this.windowElements.buttons.start.init = () => {

            DS.get('buttons','start').addEventListener("click", function (e) {
                //Validation
                DS.flushErrors();

                if (DS.get('spans','searchFor').value === '') {
                    DS.addError('Error: Search for must not be empty');
                }


                // Execution
                DS.validate(() => {
                    DS.get('spans','validation_bar').innerHTML = 'Running...';
                    (async function start() {

                        //When start button pressed
                        //Save inputs
                        linkedinUserConfig.startSearchPageNumber = DS.get('spans','startFromPage').value;
                        linkedinUserConfig.addContactsDefaultSearchKeyword = DS.get('spans','searchFor').value;
                        Storage.set('linkedinTasks', '', linkedinUserConfig);

                        let i = null;
                        let invitablePeople = [];
                        for (i = linkedinUserConfig.startSearchPageNumber; i <= 100; i++) {
                            //Go to api page and get invitable accounts from it
                            invitablePeople = await ipcRenderer.invoke('get-invitable-people', i)
                            invitablePeople = JSON.parse(invitablePeople);

                            linkedinUserConfig = Storage.get('linkedinTasks');

                            if (!linkedinUserConfig.hasOwnProperty('outcontactsPeople')) {
                                linkedinUserConfig['outcontactsPeople'] = {};
                            }

                            Object.keys(invitablePeople).forEach(key => {
                                linkedinUserConfig['outcontactsPeople'][key] = invitablePeople[key];
                            });

                            //Store results in outcontacts
                            linkedinUserConfig.startSearchPageNumber++;
                            DS.get('spans','startFromPage').value = linkedinUserConfig.startSearchPageNumber;
                            await Storage.set('linkedinTasks', '', linkedinUserConfig);
                        }

                        // let driver = new webdriver.Builder()
                        //     .forBrowser('chrome')
                        //     .build();
                        //
                        // try {
                        //
                        //     await driver.get('https://www.linkedin.com');
                        //     driver.manage().window().maximize();
                        //     await driver.sleep(1000);
                        //     let LinkedinLogin = driver.findElement(By.id('session_key'));
                        //     LinkedinLogin.sendKeys(login);
                        //     let LinkedinPassword = driver.findElement(By.id('session_password'));
                        //     LinkedinPassword.sendKeys(password);
                        //     await driver.sleep(1000);
                        //     let loginButton = driver.findElement(By.css('button.sign-in-form__submit-button'));
                        //     loginButton.click();
                        //
                        //     await driver.sleep(15000);
                        //
                        //     while (true) {
                        //         driver.get('https://www.linkedin.com/search/results/people/?keywords='+DS.get('spans','searchFor').value+'&origin=SWITCH_SEARCH_VERTICAL&page='+linkedinUserConfig.startSearchPageNumber+'&sid='+userHelper.generateRandomString(3));
                        //         await driver.sleep(5000);
                        //
                        //         let buttonsContainer = await driver.findElements(By.css(".ph0.pv2.artdeco-card.mb2 ul.reusable-search__entity-result-list.list-style-none li div.entity-result__actions.entity-result__divider div button[aria-label^='Пригласить участника']"));
                        //
                        //         for (let i = 0; i < buttonsContainer.length; i++) {
                        //             await driver.sleep(500);
                        //             buttonsContainer[i].click();
                        //             await driver.sleep(500);
                        //             let dialogWindowPersonalizeButton = driver.findElement(By.css("button.artdeco-button.artdeco-button--muted.artdeco-button--2.artdeco-button--secondary.ember-view.mr1"));
                        //             dialogWindowPersonalizeButton.click();
                        //             await driver.sleep(500);
                        //             let textarea = driver.findElement(By.id("custom-message"));
                        //
                        //             textarea.sendKeys(DS.get('spans','contactMessage').value);
                        //
                        //             let sendNow = driver.findElement(By.css("button[aria-label='Отправить сейчас']"));
                        //             await driver.sleep(500);
                        //             sendNow.click();
                        //
                        //             driver.wait(until.elementLocated(By.css("div.ip-fuse-limit-alert")), 10000)
                        //                 .then(() => {
                        //                     driver.quit();
                        //                     DS.get('spans','validation_bar').innerHTML = 'Done! Week contacts limit reached.';
                        //                 });
                        //
                        //
                        //         }
                        //         await driver.sleep(2000);
                        //         linkedinUserConfig.startSearchPageNumber++;
                        //         DS.get('spans','startFromPage').value = linkedinUserConfig.startSearchPageNumber;
                        //         Storage.set('linkedinTasks', '', linkedinUserConfig);
                        //
                        //     }
                        //
                        // } finally {
                        //     await driver.quit();
                        // }

                    })();
                });

            });
        }

        this.windowElements.buttons.close.init = () => {

            DS.get('buttons','close').addEventListener("click", function (e) {
                let window = require('@electron/remote').getCurrentWindow();
                window.close();
            }); 
        }

        //Mandatory section for running Model initialization
        super.init();
    }

}