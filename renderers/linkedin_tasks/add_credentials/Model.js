const BaseModel = require("../../../modules/Base/BaseModel");

module.exports = class Model extends BaseModel {
    constructor(){
        super();

        const DS = this;

        //Defining elements location
        this.windowElements = {
            buttons: {
                login:    {
                    location: document.getElementById("login-button")
                },
                logout:    {
                    location: document.getElementById("logout-button")
                },
                close:  {
                    location: document.getElementById("close")
                },
                mfa_send:  {
                    location: document.getElementById("mfa-send")
                },
                get_contacts:  {
                    location: document.getElementById("get-contacts")
                },
            },
            spans: {
                login_button: {
                    location: document.querySelector('#login-button')
                },
                logout_button: {
                    location: document.querySelector('#logout-button')
                },
                validation_bar: {
                    location: document.querySelector('#validation-bar-span')
                },
                login_inputs: {
                    location: document.querySelector('#login-inputs')
                },
                login: {
                    location: document.querySelector('#login')
                },
                login_status: {
                    location: document.querySelector('#login-status')
                },
                login_block: {
                    location: document.querySelector('#login-block')
                },
                password: {
                    location: document.querySelector('#password')
                },
                password_block: {
                    location: document.querySelector('#password-block')
                },
                mfa_block: {
                    location: document.querySelector('#mfa-code-block')
                },
                mfa_code: {
                    location: document.querySelector('#mfa-code')
                },
                contacts_block: {
                    location: document.querySelector('#contacts-block')
                },
                contacts_number: {
                    location: document.querySelector('#my-contacts-number')
                }
            },
        };

        this.windowElements.spans.login_inputs.init = () => {
            updateLoginStatus();
        };

        this.windowElements.spans.login.init = () => {
            DS.get('spans','login').value = linkedinUserConfig.username;
        };

        this.windowElements.spans.password.init = () => {
            DS.get('spans','password').value = linkedinUserConfig.password;
        };

        async function onLoginSuccess() {
            DS.get('spans','validation_bar').innerHTML = 'Successfully logged in';
            let response = await ipcRenderer.invoke('get-linkedin-urn-id', '');
            let userUrnId = response;
            linkedinUserConfig.userUrnId = userUrnId;

            updateLoginStatus();
            return true;
        }

        async function isLoggedIn() {
            ipcRenderer.send('login-event', []);
            return await ipcRenderer.invoke('check-linkedinapi-status', '')
        }

        async function updateLoginStatus(){
            if (await isLoggedIn()) {
                DS.get('spans','login_button').classList.add('hidden');
                DS.get('spans','logout_button').classList.remove('hidden');
                DS.get('spans','login_inputs').classList.add("hidden");
                DS.get('spans','contacts_block').classList.remove('hidden');
                let response = await ipcRenderer.invoke('get-all-contacts-summary', '');
                let contactsNumberText = null;
                if (response) {
                    DS.get('spans','contacts_number').classList.remove('small-hint');
                    contactsNumberText = response;
                } else {
                    DS.get('spans','contacts_number').classList.add('small-hint');
                    contactsNumberText = 'press update';
                }
                DS.get('spans','contacts_number').innerHTML = contactsNumberText;


            } else {
                DS.get('spans','logout_button').classList.add('hidden');
                DS.get('spans','contacts_block').classList.add('hidden');
                DS.get('spans','login_button').classList.remove('hidden');
                DS.get('spans','login_inputs').classList.remove("hidden");
                DS.get('spans','contacts_number').classList.add('small-hint');
                DS.get('spans','contacts_number').innerHTML = `press update`;
            }
            updateStatus();
        }

        async function updateStatus() {
            if (await isLoggedIn()){
                DS.get('spans','login_status').classList.remove("grey");
                DS.get('spans','login_status').classList.add("green");
                DS.get('spans','login_status').innerHTML = "&#9679; Logged in";
            } else {
                DS.get('spans','login_status').classList.remove("green");
                DS.get('spans','login_status').classList.add("grey");
                DS.get('spans','login_status').innerHTML = "&#9679; Logged out";
            }
        }

        this.windowElements.buttons.mfa_send.init = () => {
            DS.get('buttons','mfa_send').addEventListener("click", function (e) {
                DS.get('spans','validation_bar').innerHTML = 'Sending MFA code...';
                ipcRenderer.invoke('linkedinapi-mfa-check', DS.get('spans','mfa_code').value)
                    .then((result) => {
                        switch (result) {
                            case 'loginSuccessfull':
                                onLoginSuccess();
                                break;
                        }
                    })
            });
        }

        this.windowElements.buttons.login.init = () => {

            DS.get('buttons','login').addEventListener("click", function (e) {
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

                if ((DS.get('spans','login').value === '')) {
                    DS.addError('Error: Login shouldn\'t be empty');
                }

                if ((DS.get('spans','password').value === '')) {
                    DS.addError('Error: Password shouldn\'t be empty');
                }

                // Execution
                DS.validate(() => {

                    linkedinUserConfig.username = DS.get('spans','login').value;
                    linkedinUserConfig.password = DS.get('spans','password').value;
                    DS.get('spans','validation_bar').innerHTML = 'Starting linkedin api...';

                    ipcRenderer.invoke('create-linkedinapi-demon', [])
                    .then((result) => {
                        DS.get('spans','validation_bar').innerHTML = 'Try to login...';
                        ipcRenderer.invoke('linkedinapi-login', {
                            login: linkedinUserConfig.username,
                            password: linkedinUserConfig.password,
                        })
                            .then(async (loginResult) => {
                                switch (loginResult) {
                                    case 'loginSuccessfull':
                                        await onLoginSuccess();
                                        break;
                                    case 'loginFailed':
                                        DS.get('spans','validation_bar').innerHTML = 'Login failed';
                                        break;
                                    case 'waitForMfa':
                                        DS.get('spans','validation_bar').innerHTML = 'Please enter MFA code';
                                        DS.get('spans','mfa_block').classList.remove("invisible");
                                    break;
                                }
                                const response = Storage.set('linkedinTasks', '', linkedinUserConfig);

                            })
                    })

                });

            });
        }

        this.windowElements.buttons.get_contacts.init = () => {
            DS.get('buttons','get_contacts').addEventListener("click", async function (e) {
                DS.get('spans','validation_bar').innerHTML = 'Getting contacts. Please wait few minutes...';
                let response = await ipcRenderer.invoke('get-all-contacts-import', '');
                DS.get('spans','validation_bar').innerHTML = 'Contacts imported successfully!';
                updateLoginStatus();
            });
        }

        this.windowElements.buttons.close.init = () => {

            DS.get('buttons','close').addEventListener("click", function (e) {
                let window = require('@electron/remote').getCurrentWindow();
                window.close();
            }); 
        }

        this.windowElements.buttons.logout.init = () => {

            DS.get('buttons','logout').addEventListener("click", async function (e) {
                await ipcRenderer.invoke('linkedinapi-stop', '');
                updateLoginStatus();
            });
        }

        //Mandatory section for running Model initialization
        super.init();
    }

}