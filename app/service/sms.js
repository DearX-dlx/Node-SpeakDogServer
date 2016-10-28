/**
 * Created by kangleyuan on 2016/10/28.
 */

var https = require('https');
var querystring = require('querystring');
var Promise = require('bluebird');
var speakeasy = require('speakeasy');

//对外暴露的方法 生产验证码 返回验证码
exports.getCode = function () {
    //设置speckeasy生产验证码的规则
    var code = speakeasy.totp({
        secret:'speakdog-dearx',
        digits:4
    })

    return code
}

// 发送短信的功能
exports.send = function (phoneNumber, msg) {
    return new  Promise(function (resolve,reject) {
        //如果没有手机号 那就返回一个错误
        if (!phoneNumber) {
            return reject(new Error('手机号为空'))
        }

        //发送短信
        var postData = {
            mobile:phoneNumber,
            message:msg + '【会说话的狗】'
        };

        var content = querystring.stringify(postData);

        var options = {
            host:'sms-api.luosimao.com',
            path:'/v1/send.json',
            method:'POST',
            auth:'api:key-939d12e82919f91530a842af3bc924f3',
            agent:false,
            rejectUnauthorized : false,
            headers:{
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' :content.length
            }
        };

        var str = ''
        var req = https.request(options,function(res){
            //验证网络是否通畅
            if (res.statusCode === 404) {
                reject(new Error('短信服务商没有响应'))
            }

            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                //将返回的数据进行拼接
                str += chunk
            });
            res.on('end',function(){
                var data
                try {
                    //转成标准的json数据
                    data = JSON.parse(str)
                }catch (e) {
                    reject(e)
                }
                // 根据返回的数据进行判断
                if (data.error === 0) {
                    resolve(data)
                }else {
                    //进行错误信息的判断
                    var errorMap = {
                        "-10":	"验证信息失败	检查api key是否和各种中心内的一致，调用传入是否正确",
                        "-11":	"用户接口被禁用	滥发违规内容，验证码被刷等，请联系客服解除",
                        "-20":	"短信余额不足	进入个人中心购买充值",
                        "-30":	"短信内容为空	检查调用传入参数：message",
                        "-31":	"短信内容存在敏感词	接口会同时返回  hit 属性提供敏感词说明，请修改短信内容，更换词语",
                        "-32":	"短信内容缺少签名信息	短信内容末尾增加签名信息eg.【公司名称】",
                        "-33":	"短信过长，超过300字（含签名）	调整短信内容或拆分为多条进行发送",
                        "-34":	"签名不可用	在后台 短信->签名管理下进行添加签名",
                        "-40":	"错误的手机号	检查手机号是否正确",
                        "-41":	"号码在黑名单中	号码因频繁发送或其他原因暂停发送，请联系客服确认",
                        "-42":	"验证码类短信发送频率过快	前台增加60秒获取限制",
                        "-50":	"请求发送IP不在白名单内	查看触发短信IP白名单的设置",
                    }
                    reject(new Error(errorMap[data.error]))
                }
            });
        });

        req.write(content);
        req.end();
    })
}
