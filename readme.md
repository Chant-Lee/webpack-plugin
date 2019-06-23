## webpack简单插件开发

### 对插件的认识
官方解释：插件是 `webpack` 的支柱功能。`webpack` 自身也是构建于，你在 `webpack` 配置中用到的相同的插件系统之上！插件目的在于解决 loader 无法实现的其他事。

webpack 的插件有很多，有内置插件当然还有社区提供的插件，当然你自己也可以开发一个插件。社区的插件我们需要使用 npm 先进行安装，然后在引入，内置的插件在 webpack.optimize 对象上，我们可以直接使用。[常见的内置插件](https://webpack.docschina.org/plugins)

### 准备工作
#### 文档

首先需要看下官方教程和api[官方教程](https://webpack.js.org/contribute/writing-a-plugin/)

#### 了解插件的基本组成

##### 插件开发组成
* 一个 JavaScript 命名函数。
* 在插件函数的 prototype 上定义一个 apply 方法。
* 指定一个绑定到 webpack 自身的事件钩子。
* 处理 webpack 内部实例的特定数据。
* 功能完成后调用 webpack 提供的回调。

伪代码如下所示：
```
class MyWebpackPlugin {
    constructor (options) {
        this.options = options
    }

    apply (compiler) {
        
    }
}

module.exports = MyWebpackPlugin
```

#### 常用 api

前面讲了 webpack 编写插件时提供了大量的 API, 好多是我们不经常用的，下面总结了一些常用的 API, 这些 API 主要存储在 compilation 对象中

常用对象 | 提供的钩子函数
---|---
Compiler | 	run,compile,compilation,<br>make,emit,done
Compilation | buildModule,normalModuleLoader,<br>succeedModule,finishModules,seal,<br>optimize,after-seal
Module Factory	| beforeResolver,afterResolver,<br>module,parser
Parser | program,statement,call,expression
Template | hash,bootstrap,localVars,render

* `compilation.modules`：编译后的（内置输入的）模块数组。每个模块管理控制来源代码库 (source library) 中的原始文件 (raw file) 的构建。 module.fileDependencies：模块中引入的源文件路径构成的数组。这包括源 JavaScript 文件本身（例如：index.js）以及它所需的所有依赖资源文件（样式表、图像等）。审查依赖，可以用于查看一个模块有哪些从属的源文件。

* `compilation.chunks`：编译后的（构建输出的）chunk 数组。每个 chunk 所管理控制的最终渲染资源的组合，在 chunk 中还有以下属性：
  - chunk.modules：chunk 中引入的模块构成的数组。通过扩展 (extension) 可以审查每个模块的依赖，来查看哪些原始源文件被注入到 chunk 中。
  - chunk.files：chunk 生成的输出文件名构成的数组。你可以从 compilation.assets 表中访问这些资源来源。
* compilation.assets 包含所有模块的对象，我们可以通过他来获取某个文件信息和内容，也可也可以修改获取的文件，并且也可以向该对象中添加文件（或文件夹）

   - assets[filename].source() 读取输出资源的内容
   - assets[filename].size() 读取输出资源的文件大小
* compiler.options.plugins 获取配置中使用的插件列表
* watch.compiler.watchFileSystem.watcher.mtimes 获取发生变化的文件列表

```
// 监听文件变化事件
compiler.plugin('watch-run',(watch,callback)=>{
    // 获取发生变化的文件列表（数组）
   let  filesChange = watch.compiler.watchFileSystem.watcher.mtimes;
   callback();
})

compiler.plugin('after-compile', (compilation, callback) => {
    // 把要观察的文件路径filePath 添加到webpack观察数组中
    let filesAry = [...compilation.fileDependencies]
    filesAry.push(filePath);
    compilation.fileDependencies = filesAry;
    callback();
});
```

### 实践编写一个简单插件插件
#### 首先第一步，使用 compiler 的 emit 钩子

emit 事件是将编译好的代码发射到指定的 stream 中触发，在这个钩子执行的时候，我们能从回调函数返回的 compilation 对象上拿到编译好的 stream。
```
compiler.hooks.emit.tap('aaa',(compilation)=>{})
```
#####  第二步， 遍历 compilation.assets 对象，然后调用Object.source () 得到内容
我们需要**compilation.assets** 通过遍历它，我们可以得到bound.js

准备好一个去掉注释的正则
```
        const reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)|(\/\*\*\*\*\*\*\/)/g

```

##### 第三步，更新 compilation.assets [data] 对象

```
compilation.assets[data] = {
    source(){
        return content
    },
    size(){
        return content.length
    }
}
复制代码

```
##### 完整代码如下
```
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
```
##### 最后  在 webpack 中引用插件

```
const path = require('path');
const MyWebpackPlugin = require('./webpack-plugin/index')
const MyAddOptionPlugin = require('./webpack-plugin/add-name')

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  plugins: [
    new MyWebpackPlugin(),
    
    new MyAddOptionPlugin({ name: 'chant-lee' })
  ]
};
```
**[插件地址](https://github.com/Chant-Lee/webpack-plugin)**