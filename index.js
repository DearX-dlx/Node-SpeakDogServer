/**
 * Created by kangleyuan on 16/10/17.
 */

// ---------------------------------- 初始化所有的数据模型 -->数据库表 ----------------------- \\

//加载模型 -- 进行模型初始化
var fs = require('fs')
var path = require('path')
var mongoose = require('mongoose')
// 要连接的数据库 -- 如果没有mongo会重新创建一个
var db = 'mongodb://localhost/speak-dog'
//设置mongoose的Promise库 用来处理node与数据库通信的时候信息控制
mongoose.Promise = require('bluebird')
//连接数据库服务器
mongoose.connect(db)
//遍历所有的模型 进行模型的初始化(会在数据库中建立起对应的表结构)
//当然也可以直接一个一个的引入进来
var model_path = path.join(__dirname,'/app/models')
var walk = function (modelPath) {
    //同步读出models文件夹下所有的文件
    fs.readdirSync(modelPath).forEach(function (file) {
        var filePath = path.join(modelPath,'/' + file)
        //获取文件的类型
        var stat = fs.statSync(filePath)
        //判断是否是文件类型
        if (stat.isFile()){
            //对test函数里面的file进行正则匹配
            if (/(.*)\.(js)/.test(file)) {
                require(filePath)
            }
            //如果不是文件是文件夹 那么继续进行遍历
        }else if(stat.isDirectory()) {
            walk(filePath)
        }
    })
}

walk(model_path)


// ---------------------------------- 程序的核心 ----------------------- \\

//node的http轻量级组件
var koa = require('koa')
//日志中间件
var logger = require('koa-logger')
//会话中间件
var session = require('koa-session')
//解析post数据
var bodyParser = require('koa-bodyparser')
//koa 实例
var app = koa()
//使用各组件
//session的加密处理工具
app.keys = ['speakdog']
app.use(logger())
app.use(session(app))
app.use(bodyParser())

//进行路由控制
var router = require('./config/routes')()
//这是固定的写法 对应的路由 已经对应响应的方法
app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(1234)
console.log('Listening:1234')