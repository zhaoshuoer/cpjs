#!/usr/bin/env node
const utils = require('./src/utils')
var argv = require('yargs')
    .version('0.0.1')
    .option('sources', {
        alias: 's',
        demand: true,
        describe: '源目录',
        default: utils.getCurrDir(),
        type: 'string'
    })
    .option('dest', {
        alias: 'd',
        demand: true,
        describe: '目标目录',
        default: utils.getDefaultDestDir(),
        type: 'string',
        array:true
    })
    .option('filename', {
        alias: 'f',
        demand: false,
        describe: '复制的文件名称',
        default: ['name.js','name.css'],
        type: 'string',
        array:true
    })
    .option('compile', {
        alias: 'c',
        boolean: true,
        describe: '是否编译',
        default: false,
        type: 'string'
    })
    .usage('格式: cpjs [options]')
    .example('cpjs', `-s=${utils.getCurrDir()} -d=${utils.getDefaultDestDir()}`)
    .help('h')
    .alias('h', 'help')
    .epilog('')
    .argv;
// let aa = utils.findAvailableDir(utils.getFullPath(argv.s))
console.log(utils.getAvailableFolder(utils.getFullPath(argv.s)))
// console.log(aa)

