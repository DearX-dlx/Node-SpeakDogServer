/**
 * Created by kangleyuan on 16/10/17.
 */

var xss = require('xss') // 防止xss注入的框架
var mongoose = require('mongoose') // 数据库管理工具
var User = mongoose.model('User') // 导入数据模型
var uuid = require("uuid") //生成token
var sms = require("../service/sms")

/*
 * 获取验证码
 */
exports.signup = function *(next) {
    //获取到请求中的phoneNumber字段  这是拿URL地址里面的字段 this.body 是拿body里面的字段
    var phoneNumber = String(this.query.phoneNumber)
    //console.log(phoneNumber)
    //需要 加一层手机验证验证手机号码
    if (phoneNumber.length < 10) {
        this.body = {
            success:false,
            error:'手机号码输入不正确'
        }

        return next
    }
    //The yield keyword is used to pause and resume a generator function
    var user = yield User.findOne({
        phoneNumber:phoneNumber
    }).exec()

    //生成验证码
    var verifyCode = sms.getCode()

    //如果没有的话就实例化一个
    if (!user) {
        var accessToken = uuid.v4()
        user = new User({
            nickname:'无名',
            phoneNumber:xss(phoneNumber),
            verifyCode:verifyCode,
            accessToken:accessToken,
            avatar:''
        })
    }else {
        user.verifyCode = verifyCode
    }
    //进行数据的更新
    try {
        user = yield user.save()
    }catch(e) {
        //出错就返回错误信息
        this.body = {
            success:false
        }
        return next
    }

    //发送短信验证码
    var msg = '您的验证码是：' + verifyCode
    try {
        sms.send(user.phoneNumber , msg)
    }catch (e){
        console.log(e)
        this.body = {
            success:false,
            error:'短信服务异常'
        }
    }

    //到这里就执行成功了
    this.body = {
        success:true
    }

}

/*
 * 登录模块
 */
exports.verify = function *(next) {

    //拿到参数
    var verifyCode = this.request.body.verifyCode
    var phoneNumver = this.request.body.phoneNumber
    //确认是否有这两个字段
    if (!verifyCode || !phoneNumver) {
        this.body = {
            success:false,
            error:'验证出错'
        }
        return next
    }
    //到数据库里面验证是否存在这样的数据 并且返回满足条件的数据
    var user = yield User.findOne({
        phoneNumber:phoneNumver,
        verifyCode:verifyCode
    }).exec()

    //如果找到了user那么就验证通过了
    if (user) {
        //将验证状态改成已经验证
        user.verified = true
        //刷新信息
        user = yield user.save()

        this.body = {
            success:true,
            data: {
                nickname: user.nickname,
                accessToken: user.accessToken,
                avatar: user.avatar,
                id:user._id
            }
        }
        return next
    }else {
        //不存在这一的数据
        this.body = {
            success:false,
            error:'验证未通过'
        }
        return next
    }

    this.body = {
        success:true
    }
}
exports.update = function *(next) {

    var body = this.request.body
    var accessToken = body.accessToken
    if (!accessToken) {
        this.body = {
            success:false,
            error:'缺少参数accessToken'
        }
        return next
    }
    var user = yield User.findOne({
        accessToken:accessToken
    })

    if (!user) {
        this.body = {
            success:false,
            error:'没有找到用户'
        }
        return next
    }

    var fields  = 'avatar,gender,age,nickname,breed'.split(',')
    //遍历--修改
    fields.forEach(function (field) {
        if (body[field]) {
            user[field] = body[field]
        }
    })

    user = yield user.save()

    this.body = {
        success:true,
        data: {
            nickname: user.nickname,
            accessToken: user.accessToken,
            avatar: user.avatar,
            id:user._id,
            gender:user.gender,
            age:user.age,
            breed:user.breed
        }
    }
}