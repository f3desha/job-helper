const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { promisify } = require('util');
const { resolve } = require('path');
const path = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const PORT = 2402;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());


build();
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})

async function build() {
    let routers = [];
    //Traverse all folders recursively and find all Router.js files in
    const allFiles = await getFiles(`..${path.sep}..${path.sep}app${path.sep}Traversa`);

    //Based on found, build dynamic array of paths to this files
    for (let i = 0; i < allFiles.length; i++) {
        //Build map containing new objects required this files
        routers.push(await buildUsableRouter(allFiles[i]));
    }

    //Iterate and use all of them
    let routersInstances = [];

    for (let i = 0; i < routers.length; i++) {
        //Build map containing new objects required this files
        routersInstances.push(require(routers[i].pathToRouter + path.sep + routers[i].fileName));
    }

    //Enjoy
    for (let i = 0; i < routersInstances.length; i++) {
        routers[i].pathForExpress = routers[i].pathForExpress.replaceAll(path.sep,'/')
            app.use(routers[i].pathForExpress,routersInstances[i]);
    }
}

async function getFiles(dir, originalPath, excludedFolders = [], excludedFiles = []) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = resolve(dir, subdir);
        let r = null;
        let trimed = res.split(originalPath+'/');
        let cleanName = trimed[1];

        if((await stat(res)).isDirectory()){
            //Exclude folders
            if(!excludedFolders.includes(cleanName)){
                r = getFiles(res, originalPath, excludedFolders, excludedFiles);
            }
        } else {
            //Exclude files
            if(!excludedFiles.includes(cleanName)){
                r = res;
            }
        }
        return r;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

async function buildUsableRouter(pathToRouter){
    let parts = pathToRouter.split(path.sep);
    let short = pathToRouter.split('Traversa');
    let b = short[1].split(path.sep);
    b.pop();
    let pfe = b.join(path.sep);

    return {
        fileName: parts.pop(),
        pathToRouter: parts.join(path.sep),
        pathForExpress: pfe
    };
}