const BaseModel = require("../../../modules/Base/BaseModel");

module.exports = class Model extends BaseModel {
    constructor(){
        super();

        const DS = this;

        //Defining elements location
        this.windowElements = {
            buttons: {
                save:    {
                    location: document.getElementById("save")
                },
                clear:    {
                    location: document.getElementById("clear")
                },
                close:  {
                    location: document.getElementById("close")
                },
                mfa_send:  {
                    location: document.getElementById("mfa-send")
                },
            },
            spans: {
                validation_bar: {
                    location: document.querySelector('#validation-bar-span')
                },
                login: {
                    location: document.querySelector('#login')
                },
                password: {
                    location: document.querySelector('#password')
                },
                mfa_block: {
                    location: document.querySelector('#mfa-code-block')
                },
                mfa_code: {
                    location: document.querySelector('#mfa-code')
                },
            },
        };

        this.windowElements.spans.login.init = () => {
            DS.get('spans','login').value = linkedinUserConfig.username;
        };

        this.windowElements.spans.password.init = () => {
            DS.get('spans','password').value = linkedinUserConfig.password;
        };

        this.windowElements.buttons.mfa_send.init = () => {
            DS.get('buttons','mfa_send').addEventListener("click", function (e) {
                DS.get('spans','validation_bar').innerHTML = 'Sending MFA code...';
                ipcRenderer.invoke('linkedinapi-mfa-check', DS.get('spans','mfa_code').value)
                    .then((result) => {
                        switch (result) {
                            case 'loginSuccessfull':
                                DS.get('spans','validation_bar').innerHTML = 'Successfully logged in';
                                break;
                        }
                    })
            });
        }

        this.windowElements.buttons.save.init = () => {

            DS.get('buttons','save').addEventListener("click", function (e) {
                //Validation
                DS.flushErrors();

                if (DS.get('spans','login').value !== '') {
                    if (!String(DS.get('spans','login').value)
                        .toLowerCase()
                        .match(
                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                        )) {
                        DS.addError('Error: Login should have email format');
                    }
                }

                if ((DS.get('spans','login').value === '' && DS.get('spans','password').value !== '')) {
                    DS.addError('Error: Login shouldn\'t be empty');
                }

                if ((DS.get('spans','password').value === '' && DS.get('spans','login').value !== '')) {
                    DS.addError('Error: Password shouldn\'t be empty');
                }

                // Execution
                DS.validate(() => {

                    linkedinUserConfig.username = DS.get('spans','login').value;
                    linkedinUserConfig.password = DS.get('spans','password').value;

                    ipcRenderer.invoke('create-linkedinapi-demon', [])
                    .then((result) => {
                        DS.get('spans','validation_bar').innerHTML = 'Try to login...';
                        ipcRenderer.invoke('linkedinapi-login', {
                            login: linkedinUserConfig.username,
                            password: linkedinUserConfig.password,
                        })
                            .then((loginResult) => {
                                switch (loginResult) {
                                    case 'loginSuccessfull':
                                        DS.get('spans','validation_bar').innerHTML = 'Successfully logged in';
                                    break;
                                    case 'loginFailed':
                                        DS.get('spans','validation_bar').innerHTML = 'Login failed';
                                        break;
                                    case 'waitForMfa':
                                        DS.get('spans','validation_bar').innerHTML = 'Please enter MFA code';
                                        DS.get('spans','mfa_block').classList.remove("invisible");
                                    break;
                                }
                            })
                    })
                    try {
                        const response = Storage.set('linkedinTasks', '', linkedinUserConfig);
                    } catch (e) {
                        console.error(e);
                    }

                    // ipcRenderer.send('login-event', []);
                    // let window = require('@electron/remote').getCurrentWindow();
                    // window.close();

                });

            });
        }

        this.windowElements.buttons.clear.init = () => {

            DS.get('buttons','clear').addEventListener("click", function (e) {
                DS.get('spans','login').value = '';
                DS.get('spans','password').value = '';
                DS.get('spans','validation_bar').innerHTML = 'Cleared';
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