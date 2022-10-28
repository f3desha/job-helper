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
                stop:    {
                    location: document.getElementById("stop")
                },
                close:  {
                    location: document.getElementById("close")
                },
            },
            spans: {
                validation_bar: {
                    location: document.querySelector('#validation-bar-span')
                },
                contactMessage: {
                    location: document.querySelector('#contact-message')
                },
            },
        };

        this.windowElements.spans.contactMessage.init = () => {
            const defaultAddContactsMessage = linkedinUserConfig.addContactsDefaultMessage;
            DS.get('spans','contactMessage').value = defaultAddContactsMessage;
        }
    
        this.windowElements.buttons.start.init = () => {

            DS.get('buttons','start').addEventListener("click", function (e) {
                //Validation
                DS.flushErrors();

                if (DS.get('spans','contactMessage').value === '') {
                    DS.addError('Error: Message must not be empty');
                }

                // Execution
                DS.validate(() => {
                    DS.get('spans','validation_bar').innerHTML = 'Running...';
                    (async function start() {
                        linkedinUserConfig.addContactsDefaultMessage = DS.get('spans','contactMessage').value;
                        var today = new Date();
                        var dd = String(today.getDate()).padStart(2, '0');
                        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                        var yyyy = today.getFullYear();

                        let allowedToRun = false;
                        if (linkedinUserConfig.lastInviteRunDate !== `${dd}-${mm}-${yyyy}`) {
                            //New day started. Reset limits and run
                            linkedinUserConfig.inviteDailyLimit = 20;
                            allowedToRun = true;
                        }

                        if (linkedinUserConfig.lastInviteRunDate === `${dd}-${mm}-${yyyy}` && linkedinUserConfig.inviteDailyLimit > 0) {
                            allowedToRun = true;
                        }

                        if (allowedToRun){
                            linkedinUserConfig.lastInviteRunDate = `${dd}-${mm}-${yyyy}`;
                            Storage.set('linkedinTasks', '', linkedinUserConfig);

                            //Get all invites list
                            let invitesCount = Object.keys(linkedinUserConfig.outcontactsPeople).length;
                            //For every invite init event of sending invitation
                            for (let link in linkedinUserConfig.outcontactsPeople) {

                                if (!(linkedinUserConfig.lastInviteRunDate === `${dd}-${mm}-${yyyy}` && linkedinUserConfig.inviteDailyLimit > 0)){
                                    //Limit not exceeded
                                    break;
                                }
                                let invitationResult = await ipcRenderer.invoke('send-linkedin-invitation', {
                                    message: DS.get('spans','contactMessage').value,
                                    profileLink: link
                                })

                                //After invitation successfully sent , remove it from invites list
                                delete linkedinUserConfig.outcontactsPeople[link];
                                linkedinUserConfig.inviteDailyLimit--;
                                Storage.set('linkedinTasks', '', linkedinUserConfig);
                            }
                        }

                    })();
                });

            });
        }

        this.windowElements.buttons.stop.init = () => {

            DS.get('buttons','stop').addEventListener("click", async function (e) {
                await ipcRenderer.invoke('linkedinapi-cancel-action', '');
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