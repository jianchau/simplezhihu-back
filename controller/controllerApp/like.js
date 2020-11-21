var usersmodel = require('../../model/appmodel/users');
var countermodel  = require('../../model/countermodel/counters')
var questionModel = require('../../model/appmodel/questions')
var answerModel =  require('../../model/appmodel/answers')
var commentModel = require('../../model/appmodel/comments')
var getCrypto = require('../../common/crypto')
var JWT = require('jsonwebtoken');


var likeAnswer = async (req,res,next)=>{
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
            else{
                const {username} = decoded;
                const {aid} = req.query;
                const {alikes} = await answerModel.findOneAndUpdate({aid:Number(aid)},{$inc:{alikes:1}},{upsert:true,new:true,useFindAndModify:false})
                if(!alikes){
                    return res.json({
                        code:-3,
                        errmsg:'数据库操作失败'
                    })
                }
                else{
                    return res.json({
                        code:0,
                        errmsg:'ok',
                        currentLikes:alikes
                    })
                }
            }
        })
    }
}

module.exports = {likeAnswer}