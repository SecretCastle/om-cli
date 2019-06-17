#!/usr/bin/env node

/**
 * @author SecretCastle
 * @email henrychen9314@gmail.com
 * @create date 2019-06-03 22:45:33
 * @modify date 2019-06-17 23:04:01
 * @desc typescript
 */

const packageJson = require('../package.json');
const program = require('commander');
const colors = require('colors');
const downloadRep = require('download-git-repo');
const shell = require('shelljs');
const ora = require('ora');
const fs = require('fs')

/**
 * 定义初始化项目接口
 */
interface InitParam {
  dir: string;
  downloadUrl: string;
  filename: string;
}

/**
 * 定义初始化依赖接口
 */
interface DepParam {
  filename: string;
  finalPath: string;
}

// 检查node版本，不能低于指定版本
const version = shell.exec('node --version', { silent: true }).stdout;
// 版本比较
const vCompareRes = nodeVersionCompare(version, packageJson.nodeVersion);
if (vCompareRes === -1) {
  console.log(colors.red(`Please Upgrade Your Node Version Above ${packageJson.nodeVersion}`));
  process.exit(1)
}

// git url
const GIT_REMOTE_URL: string = 'https://github.com:SecretCastle/frontend-webpack-cli'
// vue
const VUE_ROOT: string = '#vue'
// react
const REACT_ROOT: string = '#react'
// ts
const TYPESCRIPT_ROOT: string = '#ts'
// react typescript
const REACT_TYPESCRIPT_ROOT: string = '#react-ts'
// common
const COMMON_ROOT: string = '#common'

let errCount: number = 0;
const errTimes: number = 5;

program
  .version(packageJson.version)
  .usage('om-cli [command] [f]')
  .option('--vue <f>', 'Create Vue Project')
  .option('-r, --react <f>', 'Create React Project')
  .option('-t, --ts <f>', 'Create TypeScript Project')
  .option('-c, --common <f>', 'Create Common Project')
  .option('--reacts <f>', 'Create React TypeScript Project')

program.on('--help', () => {
  console.log(colors.yellow(' \nExample:'))
  console.log(colors.yellow('   om-cli --ts tsDemo'))
  console.log(colors.yellow('   om-cli --react reactDemo'))
  console.log(colors.yellow('   om-cli --vue vueDemo'))
  console.log(colors.yellow('   om-cli --reacts reactTsDemo'))
  console.log(colors.yellow('   om-cli --common Demo \n'))
})

program.parse(process.argv);

if (process.argv.length === 2) {
  console.log(colors.green('Please Use "omci --h" to get help'));
}

/**
 * 初始化根路径
 */
const argv = require('minimist')(process.argv.slice(2), {
  'default': {
    'dir': process.cwd()
  }
});

const root = argv.dir;

if (program.vue) {
  const downloadUrl: string = GIT_REMOTE_URL + VUE_ROOT
  initProject({ dir: root, downloadUrl, filename: program.vue });
}
if (program.react) {
  const downloadUrl: string = GIT_REMOTE_URL + REACT_ROOT
  initProject({ dir: root, downloadUrl, filename: program.react });
}
if (program.ts) {
  const downloadUrl: string = GIT_REMOTE_URL + TYPESCRIPT_ROOT
  initProject({ dir: root, downloadUrl, filename: program.ts });
}
if (program.common) {
  const downloadUrl: string = GIT_REMOTE_URL + COMMON_ROOT
  initProject({ dir: root, downloadUrl, filename: program.common });
}

if (program.reacts) {
  const downloadUrl: string = GIT_REMOTE_URL + REACT_TYPESCRIPT_ROOT
  initProject({ dir: root, downloadUrl, filename: program.reacts });
}

/**
 * @description 初始化项目
 * @author SecretCastle
 * @date 2019-06-03
 */
function initProject(initParam: InitParam) {
  const finalPath: string = initParam.dir + '/' + initParam.filename
  // 检查存在指定文件名
  if (fs.existsSync(finalPath)) {
    console.log(colors.red('folder already exist'))
    // 退出
    process.exit(1)
  }
  try {
    const spinner = ora(colors.blue(`init ${initParam.filename} project...`));
    spinner.start();
    downloadRep(initParam.downloadUrl, finalPath, { clone: true }, (err: any) => {
      spinner.stop();
      if (err) {
        console.log(colors.red(err));
        return;
      }
      spinner.succeed(colors.green(`create project ${initParam.filename} success`));
      // 安装依赖
      installDependencies({ filename: initParam.filename, finalPath });
    })
  } catch (error) {
    if (error) {
      errCount = 1;
      if (errCount < errTimes) {
        initProject(initParam)
      } else {
        console.log(colors.red('Please Try Again later!'))
        process.exit(1);
      }
    }
  }

}

/**
 * 
 * @param depParam 
 */
function installDependencies(depParam: DepParam) {
  if (fs.existsSync(depParam.finalPath)) {
    const spinner = ora(colors.blue('install dependencies...')).start();
    shell.exec(`cd ${depParam.filename} && npm i`, { silent: true }, (err: any) => {
      if (!err) {
        spinner.succeed(colors.green('install dependencies succeed'));
        console.log(
          colors.green(
            [
              `Success! Created ${depParam.filename} at ${depParam.finalPath}`,
              'Inside that directory, you can run several commands and more:',
              '  * npm run dev: Starts you project.',
              '  * npm test: Run test.',
              'We suggest that you begin by typing:',
              `  cd ${depParam.filename}`,
              '  npm start',
              'Happy hacking!',
            ].join('\n'),
          ),
        );
      }
    });
  } else {
    console.log(colors.red('System Error, Please Try Again'))
    process.exit(1);
  }
}

function nodeVersionCompare(v1: string, v2: string): number {
  let GTR = 1; //大于
  let LSS = -1; //小于
  let EQU = 0; //等于
  const v1arr = String(v1).split(".").map(function (a) {
    return parseInt(a);
  });
  const v2arr = String(v2).split(".").map(function (a) {
    return parseInt(a);
  });
  const arrLen = Math.max(v1arr.length, v2arr.length);
  let result = 0;
  //排除错误调用
  if (v1 == undefined || v2 == undefined) {
    throw new Error();
  }
  //检查空字符串，任何非空字符串都大于空字符串
  if (v1.length == 0 && v2.length == 0) {
    return EQU;
  } else if (v1.length == 0) {
    return LSS;
  } else if (v2.length == 0) {
    return GTR;
  }

  //循环比较版本号
  for (var i = 0; i < arrLen; i++) {
    result = inerCompare(v1arr[i], v2arr[i]);
    if (result == EQU) {
      continue;
    } else {
      break;
    }
  }

  return result;

  function inerCompare(n1: number, n2: number) {
    if (typeof n1 != "number") {
      n1 = 0;
    }
    if (typeof n2 != "number") {
      n2 = 0;
    }
    if (n1 > n2) {
      return GTR;
    } else if (n1 < n2) {
      return LSS;
    } else {
      return EQU;
    }
  }
}