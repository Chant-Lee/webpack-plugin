## webpack简单插件开发
[官方教程](https://webpack.js.org/contribute/writing-a-plugin/)
### 创建插件

#### 插件开发组成
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

#### 插件的常用对象 Compiler 和 Compilation

常用对象 | 提供的钩子函数
---|---
Compiler | 	run,compile,compilation,make,emit,done
Compilation | buildModule,normalModuleLoader,succeedModule,finishModules,seal,optimize,after-seal
Module Factory	| beforeResolver,afterResolver,module,parser
Parser | program,statement,call,expression
Template | hash,bootstrap,localVars,render

* 使用 compiler 的 emit 钩子

emit 事件是将编译好的代码发射到指定的 stream 中触发，在这个钩子执行的时候，我们能从回调函数返回的 compilation 对象上拿到编译好的 stream。


```
 compiler.hooks.emit.tap('xxx',(compilation)=>{})
```
####  在 webpack 中引用插件

```
const path = require('path');
const MyWebpackPlugin = require('./webpack-plugin/index')

module.exports = {
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
    new MyWebpackPlugin()
  ]
};
```
