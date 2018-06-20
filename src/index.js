import fs from 'fs'
import utils from './utils'
console.log(utils.error('cuowu'))
let sources = '',
    dest = '',
    filePaths = [],
    errors = []
//处理参数
if (process.argv.length > 1) {
    process.argv.map((e, i) => {
        if (i > 1) {
            let key = e.split('=')[0],
                value = getFullPath(e.split('=')[1])

            if (key == 'sources' || key == '-s' || key == 's') {
                sources = value
            } else if (key == 'dest' || key == '-d' || key == 'd') {
                dest = value
            } else {
                sources = getFullPath('../../apps')
                dest = getFullPath('../dist')
                console.error(`❌ ${e} 参数错误`);
                process.exit()
            }
        }
    })
}
/**
 * 返回一个stat实例用于各种条件判断
 */
function statFollowLinks() {
    return fs.statSync.apply(fs, arguments);
}
/**
 * 用于检测目录是否存在，如果存在返回完整的目录地址！
 * 主要用于解决各个系统平台下的路径问题
 * @param {*} path 
 */
function getFullPath(path) {
    if (!fs.existsSync(path)) {
        console.error(`❌ 路径解析错误,未检测到 ${path} 文件或目录的存在！`)
        process.exit()
    }
    if (!statFollowLinks(fs.realpathSync(path)).isDirectory()) {
        console.error(`❌ 路径解析错误, ${fs.realpathSync(path)} 不是一个目录！`)
        process.exit()
    }
    return fs.realpathSync(path)
}
/**
 * 递归找到可以复制的文件
 */
(function findCopyFiles(sourcesDir) {
    if (!sourcesDir) return
    let childrens = fs.readdirSync(sourcesDir)
    if (childrens.length <= 0) return
    if (childrens.find(e => e == 'package.json') && childrens.find(e => e == 'dist')) {
        assembleCopyFiles(sourcesDir)
    } else {
        childrens.map(e => {
            let currentPath = fs.realpathSync(`${sourcesDir}/${e}`)
            if (statFollowLinks(currentPath).isDirectory() && e != 'node_modules') {
                findCopyFiles(currentPath)
            }
        })
    }
})(sources)

function assembleCopyFiles(sourcesDir){
    let indexJS = ''
    try {
        indexJS = fs.realpathSync(`${sourcesDir}/index.js`)
    } catch (e2) {
        errors.push(`❌ 未找到 ${sourcesDir} 模块下的 index.js 模块主入口文件！`)
    }
    let fileDataStr = fs.readFileSync(indexJS, 'utf8').split('\n\t').find(e => e.indexOf('name') == 0),
        appName = fileDataStr.split('"')[1],
        jsFileInfo = {
            fileName: `${appName}.js`,
            sourcesDir: `${sourcesDir}/dist`,
            destDir: dest
        },
        cssFileInfo = {
            fileName: appName + '.css',
            sourcesDir: `${sourcesDir}/dist`,
            destDir: dest
        }
    if (fs.existsSync(`${jsFileInfo.sourcesDir}/${jsFileInfo.fileName}`)) {
        filePaths = [...filePaths, jsFileInfo]
    } else {
        errors.push(`❌ 未找到 ${jsFileInfo.sourcesDir} 模块下的 ${jsFileInfo.fileName} 文件！可能您 ${sourcesDir} 模块下的index.js中定义的模块名称和webpack.config.js中输出文件名称不一致！`)
    }
    if (fs.existsSync(`${cssFileInfo.sourcesDir}/${cssFileInfo.fileName}`)) {
        filePaths = [...filePaths, cssFileInfo]
    } else {
        errors.push(`❌ 未找到 ${cssFileInfo.sourcesDir} 模块下的 ${cssFileInfo.fileName} 文件！可能您 ${sourcesDir} 模块下的index.js中定义的模块名称和webpack.config.js中输出文件名称不一致！`)
    }
}
/**
 * 复制文件到指定的位置
 */
function cp(option) {
    let sourcesFile = fs.realpathSync(`${option.sourcesDir}/${option.fileName}`)
    if (!statFollowLinks(sourcesFile).isFile()) {
        errors.push(`❌ could not read sources file ( ${option.fileName} )`)
        return
    }
    if (!option.destDir || !statFollowLinks(option.destDir).isDirectory()) {
        errors.push(`❌ could not read dest directory ( ${option.fileName} )`)
        return
    }

    try {
        fs.copyFileSync(sourcesFile, `${option.destDir}/${option.fileName}`)
        console.log(` ✅ ${option.fileName} 文件复制到 ${option.destDir} 成功! 🍺 `)
    } catch (e) {
        console.error(`❌ //@`)
        console.error(`❌ //@ ### 您当前的nodejs版本过低，请更新您的node版本 > 8.5.0`)
        console.error(`❌ //@`)
        process.exit()
    }
}
filePaths.map(fileInfo => cp(fileInfo))
errors.length > 0 && errors.map(err => console.error(err))