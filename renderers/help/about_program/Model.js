const BaseModel = require("../../../modules/Base/BaseModel");

module.exports = class Model extends BaseModel {
    constructor(){
        super();

        const DS = this;

        //Defining elements location
        this.windowElements = {
            buttons: {
                close:  {
                    location: document.getElementById("close")
                },
            },
            spans: {
                programLabel: {
                    location: document.querySelector('#program-label')
                },
                programVersion: {
                    location: document.querySelector('#program-version')
                },
                programAuthor: {
                    location: document.querySelector('#program-author')
                },
                programDevelopmentYears: {
                    location: document.querySelector('#program-development-years')
                }
            },
        };

        this.windowElements.spans.programLabel.init = () => {
            DS.get('spans','programLabel').innerHTML = programConfig.label;
        }

        this.windowElements.spans.programVersion.init = () => {
            document.title = `About Job Helper ${programConfig.version}`;
            DS.get('spans','programVersion').innerHTML = programConfig.version;
        }

        this.windowElements.spans.programDevelopmentYears.init = () => {
            DS.get('spans','programDevelopmentYears').innerHTML = programConfig.developmentYears;
        }

        this.windowElements.spans.programAuthor.init = () => {
            DS.get('spans','programAuthor').innerHTML = programConfig.author;
        }

        this.windowElements.buttons.close.init = () => {

            DS.get('buttons','close').addEventListener("click", function (e) {
                HookClientInstance.invoke();
                // let window = require('@electron/remote').getCurrentWindow();
                // window.close();
            });
        }

        //Mandatory section for running Model initialization
        super.init();
    }

}