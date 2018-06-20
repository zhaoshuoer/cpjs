import fs from 'fs'
export default {
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
    isDirectory(dirPath) {
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
    }
}