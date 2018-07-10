const fs = require('fs')
module.exports = {
    availableFolder:[],
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
        }else{
            return currDir
        }
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
    }
}