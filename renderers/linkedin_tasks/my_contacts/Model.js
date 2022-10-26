const BaseModel = require("../../../modules/Base/BaseModel");

module.exports = class Model extends BaseModel {
    constructor(){
        super();

        const DS = this;

        //Defining elements location
        this.windowElements = {
            buttons: {

            },
            spans: {

            },
        };

        this.windowElements.spans.login_inputs.init = () => {
            updateLoginStatus();
        };

        this.windowElements.spans.login.init = () => {
            DS.get('spans','login').value = linkedinUserConfig.username;
        };


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