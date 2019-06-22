const DEFAULT_OPTIONS = {
    name: 'chant-lee'
}

class MyAddOptionPlugin {

    constructor(options) {
        this.options = Object.assign({}, DEFAULT_OPTIONS, options)
    }

    apply(compiler) {
        compiler.hooks.emit.tap('addName', (compilation) => {
            compilation.chunks.forEach(chunk => {

                chunk.files.forEach(filename => {

                    let filesSource = compilation.assets[filename].source()
                    let source = `//name：${this.options.name} \n//time：${new Date()}  \n${filesSource}`

                    if ((/\.js$/).test(filename)) {
                        delete compilation.assets[filename]
                        compilation.assets[`${this.options.name}-${filename}`] = {
                            source() {
                                return source
                            },
                            size() {
                                return source.length
                            }
                        }
                    } else {
                        compilation.assets[filename] = {
                            source() {
                                return source
                            },
                            size() {
                                return source.length
                            }
                        }
                    }
                })
            })
        })
    }
}

module.exports = MyAddOptionPlugin