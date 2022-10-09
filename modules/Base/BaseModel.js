var nodeConsole = require('console');
var debugConsole = new nodeConsole.Console(process.stdout, process.stderr);

module.exports = class BaseModel {
    validation = {
        passed: true,
        errors: [],
    };

    addError(errorText) {
        this.validation.passed = false;
        this.validation.errors.push({
            type: 'error',
            message: errorText
        });
    }

    flushErrors() {
        this.validation.passed = true;
        this.validation.errors = [];
    }

    validate(func) {
        if (this.validation.passed) {
            DS.get('spans','validation_bar').classList.remove("error");
            DS.get('spans','validation_bar').classList.add("success");
            func()
        } else {
            DS.get('spans','validation_bar').classList.remove("success");
            DS.get('spans','validation_bar').classList.add("error");
            let error = this.validation.errors[0];
            DS.get('spans','validation_bar').innerHTML = error.message;
        }

    }

    constructor(){

    }

    init(){
        for (let section in this.windowElements){
            for(let element in this.windowElements[section]){
                //Init section
                if(this.windowElements[section][element].init !== undefined){
                    this.windowElements[section][element].init();
                }
            }
        }
    }

    get(elements_group, elements_id){
        return this.windowElements[elements_group][elements_id].location;
    }



}