/**
 * Created by kangleyuan on 16/10/17.
 */

//加载模型 -- 进行模型初始化
var fs = require('fs')
var path = require('path')
var mongoose = require('mongoose')
var db = 'mongodb://localhost/speak-dog'
//连接数据库
mongoose.Promise = require('bluebird')
mongoose.connect(db)
//遍历所有的模型 然后倒入
var model_path = path.join(__dirname,'/app/models')
var walk = function (modelPath) {
    fs.readdirSync(modelPath).forEach(function (file) {
        var filePath = path.join(modelPath,'/' + file)
        var stat = fs.statSync(filePath)

        if (stat.isFile()){
            if (/(.*)\.(js)/.test(file)) {
                require(filePath)
            }
        }else if(stat.isDirectory()) {
            walk(filePath)
        }
    })
}

walk(model_path)

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

var router = require('./config/routes')()
app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(1234)
console.log('Listening:1234')