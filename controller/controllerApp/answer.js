var usersmodel = require('../../model/appmodel/users');
var countermodel  = require('../../model/countermodel/counters')
var questionModel = require('../../model/appmodel/questions')
var answerModel =  require('../../model/appmodel/answers')
var commentModel = require('../../model/appmodel/comments')
var getCrypto = require('../../common/crypto')
var JWT = require('jsonwebtoken')

var addAnswer =async (req,res,next)=>{
    if(!req.headers["authorization"]){
        return res.json({
            code:-1,
            errmsg:'没有检测到登录令牌，请检查是否处于登录状态'
        })
    }
    else{
        const token = req.headers["authorization"].replace(/Bearer/,"").trim();
        try{
            const username = JWT.verify(token,'helloworld').username;
            console.log(username,req.body)
            var {qid:afor,adetail} = req.body;
            var {aid} = await countermodel.findOneAndUpdate({},{$inc:{aid:1}},{upsert:true,new:true})
            var afor = Number(afor);
            console.log(aid,username,afor,adetail)
            answerModel({
                aid,
                afrom:username,
                afor:afor,
                adetail,
                alikes:0
            }).save().then(info=>{
                if(info){
                    res.json({
                        code:0,
                        errmsg:'添加回答成功'
                    })
                }
            }).catch(err=>{
                res.json({
                    code:-3,
                    errmsg:'数据库操作失败'
                })
            })
        }
        catch(err){
            return res.json({
                code:-2,
                errmsg:'登录令牌验证失败'
            })
        }
        
    }
}

var getQanswers = async (req,res,next)=>{
    if(!req.headers["authorization"]){
        return res.json({
            code:-1,
            errmsg:'未检测到登录令牌，请检查是否处于登录状态'
        })
    }
    const token = req.headers["authorization"].replace(/Bearer/,"").trim();
    JWT.verify(token,'helloworld',async function(err,decoded){
        if(err){
            return res.json({
                code:-2,
                errmsg:'登录令牌验证失败'
            })
        }
        var qid = Number(req.query.qid);
        const question = await questionModel.findOne({qid});
        if(!question){
            return res.json({
                code:5,
                errmsg:'qid不存在'
            })
        }
        const qcontent = question.qcontent;
        var infos =  await answerModel.find({afor:qid});
        var arr = await Promise.all(infos.map( async (info,index)=>{
            const comments = await commentModel.find({cfor:info.aid});
            const user = await usersmodel.findOne({username:info.afrom})
            const {username,uavatar} = user;
        
            if(comments.length===0){
                return Promise.resolve({
                    username,
                    uavatar, 
                    aid:infos[index].aid,    
                    adetail:infos[index].adetail,
                    alikes:infos[index].alikes,
                    comments:[]
                })
            }
            else{
                return Promise.resolve({
                    username,
                    uavatar,
                    aid:infos[index].aid, 
                    adetail:infos[index].adetail,
                    alikes:infos[index].alikes,
                    comments:comments.map(async (value,index)=>
                        value.ccontent
                    )
                })
            }  
        }))
        res.json({
            code:0,
            errmsg:'请求成功',
            qcontent,
            answers:arr
        })
    })
}

module.exports = {addAnswer,getQanswers}