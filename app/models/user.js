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
    //是否验证过
    verified:{
        type:Boolean,
        default:false
    },
    accessToken:String,
    nickname:String,
    gender:String,
    breed:String,//品种
    age:String,
    avatar:String,//头像
    //创建的时间 -- 更新的时间
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

//一些存储前置逻辑的处理 - 数据存储钱的回调函数
UserSchema.pre('save',function (next) {
    //如果是一条老数据那么就把update设置成现在
    if (!this.isNew){
        this.meta.updateAt = Date.now()
    }
    //next是一个中间件 需要继续进行执行
    next()
})

//建立模型  第一个是表的名字 第二是表"约定"
var UserModel = mongoose.model('User',UserSchema)
//将模型暴露出去
module.exports = UserModel