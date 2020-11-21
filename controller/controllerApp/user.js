var usersmodel = require('../../model/appmodel/users');
var countermodel  = require('../../model/countermodel/counters')
var questionModel = require('../../model/appmodel/questions')
var answerModel =  require('../../model/appmodel/answers')
var commentModel = require('../../model/appmodel/comments')
var getCrypto = require('../../common/crypto')
var JWT = require('jsonwebtoken')
var path = require('path')
var fs = require('fs');
var register = async (req,res,next)=>{
    console.log(req.body)
    var {username,password} = req.body;
    var info = await usersmodel.findOne({username});
    if(info){
        res.json({
            code:-1,
            errmsg:'用户名已存在'
        })
    }else{
        var { uid } = await countermodel.findOneAndUpdate({}, { $inc : { uid : 1 } }, { upsert : true , new : true,useFindAndModify:false});
        var data = {
            username,
            upassword:getCrypto(password),
            uid
        }
        var info1 = await usersmodel(data).save();
        if(info1){
            res.json({
                code:0,
                errmsg:'注册成功'
            })
        }else{
            res.json({
                code:-2,
                errmsg:'数据库插入信息失败'
            })
        }
    }
}

var login = async (req,res,next)=>{
    var {username,password,verifycode} = req.body;
    var info = await usersmodel.findOne({username:username});
    
    if(!info){
        return res.json({
            code:-1,
            errmsg:'用户名不存在'
        })
    }else{
       
        if(info.upassword!==getCrypto(password)){
            return res.json({
                code:-2,
                errmsg:'密码或用户名错误'
            });
        }
        else if((req.session.captcha).toLowerCase()!==(verifycode).toLowerCase()){
            return res.json({
                code:-3,
                errmsg:'验证码错误'
            })
        }
        else{
            const token = JWT.sign(
                {username},
                'helloworld',
                {
                expiresIn:'1d'
            })
            return res.json({
                code:0,
                errmsg:'验证通过',
                token
            })
        }
    }
}

var GetMineInfo = async (req,res,next)=>{
    if(!req.headers["authorization"]){
        res.json({
            code:-1,
            errmsg:'获取数据失败，请检查是否处于登录状态'
        })
    }
    else{
        const token = req.headers["authorization"].replace(/Bearer/,"").trim();
        JWT.verify(token,'helloworld',async function(err,decoded){
            if(err){
                return res.json({
                    code:-2,
                    errmsg:'登录令牌验证失败'
                })
            }
            else{
                var username = decoded.username;
                const user =await usersmodel.findOne({username});
                var {uavatar,uid} = user;
                var uid = Number(uid)
                var qasked = await questionModel.find({qfrom:username});
               
                if(qasked.length>0){
                    qasked =await  Promise.all(qasked.map( await function(info,index){
                        return Promise.resolve(info.qcontent)
                    }))
                }
                var qanswered =  await answerModel.find({afrom:username});
                if(qanswered.length>0){
                    qanswered = await Promise.all(qanswered.map( await function(info,index){
                        return Promise.resolve(info.adetail)
                    }))
                }
                var comments = await commentModel.find({cfrom:username});
                if(comments.length>0){
                    comments= await Promise.all(comments.map( await function(info,index){
                        return Promise.resolve(info.ccontent);
                    }))
                }
                res.json({
                    code:0,
                    errmsg:'ok',
                    username,
                    uavatar,
                    qasked,
                    qanswered,
                    comments
                })
            }
        })
    }
}

var changeAvatar = async (req,res,next)=>{
    console.log(req.file)
    if(!req.headers["authorization"]){
        return res.json({
            code:-1,
            errmsg:'没有检测到登录令牌，请检查是否处于登录状态'
        })
    }
    else{
        const token = req.headers["authorization"].replace(/Bearer/,'').trim();
        JWT.verify(token,"helloworld",async function(err,decoded){
            if(err){
                return res.json({
                    code:-2,
                    errmsg:'登录令牌验证失败'
                })
            }
            console.log(req.file)
            var username = decoded.username;
            var user =await usersmodel.findOne({username});
            if(user){
                var urldel = user.uavatar.replace(/http:\/\/10.20.159.102:3000\//,"");
                console.log("urldel",urldel);
                fs.unlink(urldel,function(err,res){
                    if(err){
                        console.log(err)
                    }
                });
            }
            fs.renameSync(path.join('uploads',req.file.filename),path.join('uploads',req.file.filename+'.jpg'));
            var uavatar = 'http://10.20.159.102:3000/'+'uploads/'+req.file.filename+'.jpg';
            const info = await usersmodel.findOneAndUpdate({username},{$set:{uavatar}},{upsert:true,new:true,useFindAndModify:false})
            if(!info){
                return res.json({
                    code:-3,
                    errmsg:'数据库操作失败'
                })
            }
            return res.json({
                code:0,
                errmsg:'更换头像成功'
            })
        })
    }
}

module.exports = {register,login,GetMineInfo,changeAvatar}