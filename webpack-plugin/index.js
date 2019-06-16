class MyWebpackPlugin {
    constructor(options) {
        this.options = options
    }

    apply(compiler) {
        console.log(JSON.stringify(compiler, null, 4))
        compiler.hooks.done.tapAsync('DonePluginv', (name, callback) => {
            console.log(' 全部编译完成')
            callback()
        })
    }
}

module.exports = MyWebpackPlugin