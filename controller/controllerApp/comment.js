var usersmodel = require('../../model/appmodel/users');
var countermodel  = require('../../model/countermodel/counters')
var questionModel = require('../../model/appmodel/questions')
var answerModel =  require('../../model/appmodel/answers')
var commentModel = require('../../model/appmodel/comments')
var moment = require('moment')
var getCrypto = require('../../common/crypto')
var JWT = require('jsonwebtoken');

var addComment = async (req,res,next)=>{
    moment.locale('zh-cn');
    if(!req.headers["authorization"]){
        res.json({
            code:-1,
            errmsg:'没有检测到登录令牌，请检查是否处于登录状态'
        })
    }
    else{
        const token = req.headers["authorization"].replace(/Bearer/,"").trim();
        const decoded = await JWT.verify(token,"helloworld",async function(err,decoded){
            if(err){
                return res.json({
                    code:-2,
                    errmsg:"登录令牌验证失败"
                })
            }
            else{
                const {username} = decoded;
                var {aid,ccontent} = req.body;
                aid = Number(aid);
                const {cid} = await countermodel.findOneAndUpdate({},{$inc:{cid:1}},{upsert:true,new:true,useFindAndModify:false})
                console.log(cid,username,ccontent,aid)
                var comment = await commentModel({
                    cid,
                    cfrom:username,
                    ccontent,
                    cfor:aid,
                    ctime:moment().format('lll')
                }).save();
                if(comment){
                    return res.json({
                        code:0,
                        errmsg:'ok'
                    })
                }
                else{
                    return res.json({
                        code:-3,
                        errmsg:'数据库操作失败'
                    })
                }
            }
        })
    }
}

var getComment = async (req,res,next)=>{
    if(!req.headers["authorization"]){
        res.json({
            code:-1,
            errmsg:'没有检测到登录令牌，请检查是否处于登录状态'
        })
    }else{
        const token = req.headers["authorization"].replace(/Bearer/,"").trim();
        const decoded = await JWT.verify(token,"helloworld",async function(err,decoded){
            if(err){
                return res.json({
                    code:-2,
                    errmsg:"登录令牌验证失败"
                })
            }
            else{
                var {aid} = req.query;
                var aid = Number(aid);
                var infos = await commentModel.find({cfor:aid});
                var arr = await Promise.all(infos.map(async (info,index)=>{
                   const {username,uavatar} = await usersmodel.findOne({username:info.cfrom})
                   return Promise.resolve({
                       username,
                       uavatar
                   })                 
                }))

                var arr2 = arr.map((item,index)=>{
                    return {
                        ...item,
                        ccontent:infos[index].ccontent,
                        ctime:infos[index].ctime
                    }
                })
                return res.json({
                    code:0,
                    errmsg:'ok',
                    comments:arr2
                })
               
            }
        })
    }
}

module.exports = {getComment,addComment}