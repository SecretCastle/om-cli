#!/usr/bin/env node
"use strict";
var packageJson = require('../package.json');
var program = require('commander');
var colors = require('colors');
var downloadRep = require('download-git-repo');
var shell = require('shelljs');
var ora = require('ora');
var fs = require('fs');
var version = shell.exec('node --version', { silent: true }).stdout;
var vCompareRes = nodeVersionCompare(version, packageJson.nodeVersion);
if (vCompareRes === -1) {
    console.log(colors.red("Please Upgrade Your Node Version Above " + packageJson.nodeVersion));
    process.exit(1);
}
var GIT_REMOTE_URL = 'https://github.com:SecretCastle/frontend-webpack-cli';
var VUE_ROOT = '#vue';
var REACT_ROOT = '#react';
var TYPESCRIPT_ROOT = '#ts';
var REACT_TYPESCRIPT_ROOT = '#react-ts';
var COMMON_ROOT = '#common';
var errCount = 0;
var errTimes = 5;
program
    .version(packageJson.version)
    .usage('om-cli [command] [f]')
    .option('--vue <f>', 'Create Vue Project')
    .option('-r, --react <f>', 'Create React Project')
    .option('-t, --ts <f>', 'Create TypeScript Project')
    .option('-c, --common <f>', 'Create Common Project')
    .option('--reacts <f>', 'Create React TypeScript Project');
program.on('--help', function () {
    console.log(colors.yellow(' \nExample:'));
    console.log(colors.yellow('   om-cli --ts tsDemo'));
    console.log(colors.yellow('   om-cli --react reactDemo'));
    console.log(colors.yellow('   om-cli --vue vueDemo'));
    console.log(colors.yellow('   om-cli --reacts reactTsDemo'));
    console.log(colors.yellow('   om-cli --common Demo \n'));
});
program.parse(process.argv);
if (process.argv.length === 2) {
    console.log(colors.green('Please Use "omci --h" to get help'));
}
var argv = require('minimist')(process.argv.slice(2), {
    'default': {
        'dir': process.cwd()
    }
});
var root = argv.dir;
if (program.vue) {
    var downloadUrl = GIT_REMOTE_URL + VUE_ROOT;
    initProject({ dir: root, downloadUrl: downloadUrl, filename: program.vue });
}
if (program.react) {
    var downloadUrl = GIT_REMOTE_URL + REACT_ROOT;
    initProject({ dir: root, downloadUrl: downloadUrl, filename: program.react });
}
if (program.ts) {
    var downloadUrl = GIT_REMOTE_URL + TYPESCRIPT_ROOT;
    initProject({ dir: root, downloadUrl: downloadUrl, filename: program.ts });
}
if (program.common) {
    var downloadUrl = GIT_REMOTE_URL + COMMON_ROOT;
    initProject({ dir: root, downloadUrl: downloadUrl, filename: program.common });
}
if (program.reacts) {
    var downloadUrl = GIT_REMOTE_URL + REACT_TYPESCRIPT_ROOT;
    initProject({ dir: root, downloadUrl: downloadUrl, filename: program.reacts });
}
function initProject(initParam) {
    var finalPath = initParam.dir + '/' + initParam.filename;
    if (fs.existsSync(finalPath)) {
        console.log(colors.red('folder already exist'));
        process.exit(1);
    }
    try {
        var spinner_1 = ora(colors.blue("init " + initParam.filename + " project..."));
        spinner_1.start();
        downloadRep(initParam.downloadUrl, finalPath, { clone: true }, function (err) {
            spinner_1.stop();
            if (err) {
                console.log(colors.red(err));
                return;
            }
            spinner_1.succeed(colors.green("create project " + initParam.filename + " success"));
            installDependencies({ filename: initParam.filename, finalPath: finalPath });
        });
    }
    catch (error) {
        if (error) {
            errCount = 1;
            if (errCount < errTimes) {
                initProject(initParam);
            }
            else {
                console.log(colors.red('Please Try Again later!'));
                process.exit(1);
            }
        }
    }
}
function installDependencies(depParam) {
    if (fs.existsSync(depParam.finalPath)) {
        var spinner_2 = ora(colors.blue('install dependencies...')).start();
        shell.exec("cd " + depParam.filename + " && npm i", { silent: true }, function (err) {
            if (!err) {
                spinner_2.succeed(colors.green('install dependencies succeed'));
                console.log(colors.green([
                    "Success! Created " + depParam.filename + " at " + depParam.finalPath,
                    'Inside that directory, you can run several commands and more:',
                    '  * npm run dev: Starts you project.',
                    '  * npm test: Run test.',
                    'We suggest that you begin by typing:',
                    "  cd " + depParam.filename,
                    '  npm start',
                    'Happy hacking!',
                ].join('\n')));
            }
        });
    }
    else {
        console.log(colors.red('System Error, Please Try Again'));
        process.exit(1);
    }
}
function nodeVersionCompare(v1, v2) {
    var GTR = 1;
    var LSS = -1;
    var EQU = 0;
    var v1arr = String(v1).split(".").map(function (a) {
        return parseInt(a);
    });
    var v2arr = String(v2).split(".").map(function (a) {
        return parseInt(a);
    });
    var arrLen = Math.max(v1arr.length, v2arr.length);
    var result = 0;
    if (v1 == undefined || v2 == undefined) {
        throw new Error();
    }
    if (v1.length == 0 && v2.length == 0) {
        return EQU;
    }
    else if (v1.length == 0) {
        return LSS;
    }
    else if (v2.length == 0) {
        return GTR;
    }
    for (var i = 0; i < arrLen; i++) {
        result = inerCompare(v1arr[i], v2arr[i]);
        if (result == EQU) {
            continue;
        }
        else {
            break;
        }
    }
    return result;
    function inerCompare(n1, n2) {
        if (typeof n1 != "number") {
            n1 = 0;
        }
        if (typeof n2 != "number") {
            n2 = 0;
        }
        if (n1 > n2) {
            return GTR;
        }
        else if (n1 < n2) {
            return LSS;
        }
        else {
            return EQU;
        }
    }
}
