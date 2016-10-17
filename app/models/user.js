/**
 * Created by kangleyuan on 16/10/17.
 */

//定制模型结构 并且映射到数据表中

var mongoose = require('mongoose')

//设置模型结构
var UserSchema = new mongoose.Schema({
    phoneNumber:{
        unique:true,
        type:String
    },
    areaCode:String,
    verifyCode:String,//验证码
    accessToken:String,
    nickname:String,
    gender:String,
    breed:String,//品种
    age:String,
    avatar:String,//头像
    meta:{
        createAt:{
            type:Date,
            default:Date.now()
        },
        updateAt:{
            type:Date,
            default:Date.now()
        }
    }
})

//一些存储前置逻辑的处理
UserSchema.pre('save',function (next) {
    if (!this.isNew){
        this.meta.updateAt = Date.now()
    }
    next()
})

//建立模型  第一个是表的名字 第二是个人表段间的名字
var UserModel = mongoose.model('User',UserSchema)
//将模型暴露出去
module.exports = UserModel