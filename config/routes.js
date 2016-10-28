/**
 * Created by kangleyuan on 16/10/17.
 */
'use strict'
var Router = require('koa-router')
//路由都是跟路由一一对应的
var User = require('../app/controller/user')
var App = require('../app/controller/app')
//把该暴露出去的东西暴露出去
module.exports = function () {
    var router = new Router({
        prefix:'/api' //请求的前缀
    })
    router.post('/u/signup',User.signup)
    router.post('/u/verify',User.verify)
    router.post('/u/update',User.update)

    router.post('/signature',App.signature)

    return router
}