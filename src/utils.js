const fs = require('fs'),
    child_process = require('child_process')
module.exports = {
    availableFolder:[],
    errorMsg:[],
    isObject(obj) {
        return (typeof obj === "object" && obj !== null) || typeof obj === "function";
    },
    isArray(obj) {
        return Array.isArray(obj)
    },
    isString(str){
        return typeof str === 'string';
    },
    error(msg){
        return console.error(new Error(msg))
    },
    exit(){
        return process.exit()
    },
    getCurrDir(){
        return process.cwd()
    },
    getDefaultDestDir(){
        let currDir = this.getCurrDir()
        if (currDir.indexOf('apps') > -1 && this.isDir(`${currDir.split('apps')[0]}/www/dist`)){
            return this.getFullPath(`${currDir.split('apps')[0]}/www/dist`)
        }
        if (currDir.indexOf('www') > -1 && this.isDir(`${currDir.split('www')[0]}/www/dist`)){
            return this.getFullPath(`${currDir.split('www')[0]}/www/dist`)
        }
        return currDir
    },
    /**
     * 返回一个stat实例用于各种条件判断
     */
    statFollowLinks() {
        return fs.statSync.apply(fs, arguments);
    },
    /**
     * 用于判断文件或文件夹path路径是否存在
     * @param {*} path 
     */
    exists(path) {
        return fs.existsSync(path)
    },
    /**
     * 获取一个文件或者文件夹的完整路径
     * 在Windows下可能为“C://*.js”
     * 在Linux下可能为“/root/*.js”
     * 当路径不可用直接返回-1
     * @param {*} path 
     */
    getFullPath(path) {
        if (!this.exists(path)) return -1
        return fs.realpathSync(path)
    },
    /**
     * 是否是一个文件夹
     * @param {*} dirPath 
     */
    isDir(dirPath) {
        let fullPath = this.getFullPath(dirPath)
        if (fullPath == -1) return false
        return this.statFollowLinks(fullPath).isDirectory()
    },
    /**
     * 是否是一个文件
     * @param {*} filePath 
     */
    isFile(filePath) {
        let fullPath = this.getFullPath(filePath)
        if (fullPath == -1) return false
        return this.statFollowLinks(fullPath).isFile()
    },
    /**
     * 读取一个文件夹
     * @param {*} dirPath 
     */
    readdir(dirPath){
        if(!dirPath)return []
        if (!this.isDir(dirPath)){
            return this.error(`${dirPath} 不是一个文件夹`)
        }
        return fs.readdirSync(dirPath)
    },
    /**
     * 查找可复制的文件夹
     * @param {*} sourcesDir 
     */
    findAvailableFolder(sourcesDir){
        if (!sourcesDir) return 
        let childrens = this.readdir(sourcesDir)
        if (childrens.length <= 0) return 
        if (childrens.find(e => e == 'package.json')) {
            this.availableFolder.push(sourcesDir)
        } else {
            childrens.map(e => {
                let currentPath = this.getFullPath(`${sourcesDir}/${e}`)
                if (currentPath != -1 && this.isDir(currentPath) && e != 'node_modules') {
                    this.findAvailableFolder(currentPath)
                }
            })
        }
    },
    /**
     * 获取可复制的文件夹数组
     * @param {*} sourcesDir 
     */
    getAvailableFolders(sourcesDir){
        this.findAvailableFolder(sourcesDir)
        return this.availableFolder
    },
    /**
     * 检查环境及参数
     * @param {*} argv 
     */
    checkEnv(argv){
        let currNodeVersion = child_process.execSync('node -v').toString()
        if (parseFloat(currNodeVersion.slice(1, 4)) < 8.5){
            this.error('❌ 您当前的nodejs版本过低，请更新您的node版本 > 8.5.0')
            this.exit()
        }
        if (argv.d.length <= 1 && argv.d[0] === argv.s){
            this.error('❌ 源目录于目标目录一致，无需进行任何操作')
            this.exit()
        }
    },
    /**
     * 根据模块的主入口文件获取模块的名称
     * @param {*} sourcesDir 
     */
    getAppName(sourcesDir){
        let indexJS = ''
        try {
            indexJS = fs.realpathSync(`${sourcesDir}/index.js`)
        } catch (e) {
            return this.errorMsg.push(`❌ 未找到 ${sourcesDir} 模块下的 index.js 模块主入口文件！`)
        }
        let fileDataStr = fs.readFileSync(indexJS, 'utf8').split('\n\t').find(e => e.indexOf('name') == 0)
        return fileDataStr.split('"')[1]
    },
    /**
     * 组织可复制的文件
     * @param {*} argv 参数
     * @param {*} availableFolders 可用的文件
     */
    assembleCopyFiles(argv, availableFolders){
        let filePaths = []
        availableFolders.map(sourcesDir=>{
            let appName = this.getAppName(sourcesDir),
                sourcesDistFullPath = this.getFullPath(`${sourcesDir}/dist`)
            if (sourcesDistFullPath == -1) return this.errorMsg.push(`❌ 未找到 ${sourcesDir} 模块下的 dist 文件夹！`) 
            appName && argv.f.map(name => {
                name = name.replace('name.', `${appName}.`)
                argv.d.map(dest => {
                    filePaths.push({
                        fileName: name,
                        sourcesDir: sourcesDistFullPath,
                        destDir: this.getFullPath(dest)
                    })
                })
            })
        })
        return filePaths
    },
    cp(option){
        let sourcesFile = this.getFullPath(`${option.sourcesDir}/${option.fileName}`)
        if (!this.isFile(sourcesFile)) return this.errorMsg.push(`❌ could not read sources file ( ${option.fileName} )`)
        if (!option.destDir || !this.isDir(option.destDir)) return this.errorMsg.push(`❌ could not read dest directory ( ${option.fileName} )`)
        fs.copyFileSync(sourcesFile, `${option.destDir}/${option.fileName}`)
        console.log(` ✅ ${option.fileName} 文件复制到 ${option.destDir} 成功! 🍺 `)
    }
}