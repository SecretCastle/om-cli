#!/usr/bin / env node

/**
 * @author SecretCastle
 * @email henrychen9314@gmail.com
 * @create date 2019-06-03 17:29:10
 * @modify date 2019-06-03 17:29:10
 * @desc om-cli 简单的clone github上的脚手架项目
 */

const packageJson = require('../package.json');
const program = require('commander');
const colors = require('colors');
const downloadRep = require('download-git-repo');
const shell = require('shelljs');
const ora = require('ora');
const fs = require('fs')

// 检查node版本，不能低于指定版本
const version = shell.exec('node --version', { silent: true }).stdout;
if (version <= packageJson.nodeVersion) {
  console.log(colors.red(`Please Upgrade Your Node Version Above ${packageJson.nodeVersion}`));
  process.exit(1)
}

// git url
const GIT_REMOTE_URL = 'https://github.com:SecretCastle/frontend-webpack-cli'
// vue
const VUE_ROOT = '#vue'
// react
const REACT_ROOT = '#react'
// ts
const TYPESCRIPT_ROOT = '#ts'
// common
const COMMON_ROOT = '#common'

let errCount = 0;
const errTimes = 5;

program
  .version(packageJson.version)
  .usage('om-cli [command] [f]')
  .option('--vue <f>', 'Create Vue Project')
  .option('-r, --react <f>', 'Create React Project')
  .option('-t, --ts <f>', 'Create TypeScript Project')
  .option('-c, --common <f>', 'Create Common Project')

program.on('--help', () => {
  console.log(colors.yellow(' \nExample:'))
  console.log(colors.yellow('   om-cli --ts tsDemo'))
  console.log(colors.yellow('   om-cli --react reactDemo'))
  console.log(colors.yellow('   om-cli --vue vueDemo'))
  console.log(colors.yellow('   om-cli --common Demo \n'))
})

program.parse(process.argv);

if (process.argv.length === 2) {
  console.log(colors.green('Please Use "maron-cli --h" to get help'));
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
  const downloadUrl = GIT_REMOTE_URL + VUE_ROOT
  initProject(root, downloadUrl, program.vue);
}
if (program.react) {
  const downloadUrl = GIT_REMOTE_URL + REACT_ROOT
  initProject(root, downloadUrl, program.react);
}
if (program.ts) {
  const downloadUrl = GIT_REMOTE_URL + TYPESCRIPT_ROOT
  initProject(root, downloadUrl, program.ts);
}
if (program.common) {
  const downloadUrl = GIT_REMOTE_URL + COMMON_ROOT
  initProject(root, downloadUrl, program.common);
}

/**
 * @description 初始化项目
 * @author SecretCastle
 * @date 2019-06-03
 * @param {*} dir 目录路径
 * @param {*} downloadUrl 下载地址
 */
function initProject(dir, downloadUrl, filename) {
  const finalPath = dir + '/' + filename
  // 检查存在指定文件名
  if (fs.existsSync(finalPath)) {
    console.log(colors.red('folder already exist'))
    // 退出
    process.exit(1)
  }
  try {
    const spinner = ora(colors.blue(`init ${filename} project...`));
    spinner.start();
    downloadRep(downloadUrl, finalPath, { clone: true }, err => {
      spinner.stop();
      if (err) {
        console.log(colors.red(err));
        return;
      }
      spinner.succeed(colors.green(`create project ${filename} success`));
      // 安装依赖
      installDependencies(filename, finalPath);
    })
  } catch (error) {
    if (error) {
      errCount += 1;
      if (errCount < errTimes) {
        initProject(dir, downloadUrl, filename)
      } else {
        console.log(colors.red('Please Try Again later!'))
        process.exit(1);
      }
    }
  }

}

function installDependencies(filename, finalPath) {
  if (fs.existsSync(finalPath)) {
    const spinner = ora(colors.blue('install dependencies...')).start();
    shell.exec(`cd ${filename} && npm i`, { silent: true }, (err, stdout, stderr) => {
      if (!err) {
        spinner.succeed(colors.green('install dependencies succeed'));
        console.log(
          colors.rainbow(
            [
              `Success! Created ${filename} at ${finalPath}`,
              'Inside that directory, you can run several commands and more:',
              '  * npm run dev: Starts you project.',
              '  * npm test: Run test.',
              'We suggest that you begin by typing:',
              `  cd ${filename}`,
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