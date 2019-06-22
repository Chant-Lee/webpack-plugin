const DEFAULT_OPTIONS = {
    name: 'test'
}
class MyWebpackPlugin {
    constructor(options = {}) {
        this.options = Object.assign({}, DEFAULT_OPTIONS, options)
    }

    apply(compiler) {
        // console.log(JSON.stringify(compiler, null, 4))
        compiler.plugin('compile', (params) => {
            console.log('=====开始编译=====')
        })

        compiler.plugin("compilation", (compilation) => {
            console.log("=====正在编译ing=====")

        })

        const reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)|(\/\*\*\*\*\*\*\/)/g
        compiler.hooks.emit.tap('MyWebpackPlugin', (compilation) => {
            Object.keys(compilation.assets).forEach((data) => {
                let content = compilation.assets[data].source()
                content = content.replace(reg, (word) => {
                    return /^\/{2,}/.test(word) || /^\/\*!/.test(word) || /^\/\*{3,}\//.test(word) ? "" : word;
                });
                compilation.assets[data] = {
                    source() {
                        return content
                    },
                    size() {
                        return content.length
                    }
                }
            })
        })
        compiler.hooks.done.tapAsync('DonePluginv', (name, callback) => {
            console.log(' 全部编译完成')
            callback()
        })
    }
}

module.exports = MyWebpackPlugin