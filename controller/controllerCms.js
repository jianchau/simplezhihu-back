var JWT = require('jsonwebtoken')
var getCrypto = require('../common/crypto')
var susersModel = require('../model/cmsmodel/users');
var usersModel = require('../model/appmodel/users')
var counterModel  = require('../model/countermodel/counters');
var answerModel = require('../model/appmodel/answers')
var commentModel = require('../model/appmodel/comments')
const questionModel = require('../model/appmodel/questions');
//suser模块
var register = async (req,res,next)=>{
    var {username,password} = req.body;
    var info = await susersModel.findOne({susername:username});
    if(info){
        res.json({
            code:-1,
            errmsg:'用户名已存在'
        })
    }else{
        var { suid } = await counterModel.findOneAndUpdate({}, { $inc : { suid : 1 } }, { upsert : true , new : true,useFindAndModify:false});
        var data = {
            susername:username,
            supassword:getCrypto(password),
            suid
        }
        var info1 = await susersModel(data).save();
        if(info1){
            res.json({
                code:0,
                errmsg:'注册成功'
            })
        }else{
            res.json({
                code:-1,
                errmsg:'数据库插入信息失败'
            })
        }
    }
}
var login = async (req,res,next)=>{
    var {username:susername,password,verifycode} = req.body;

    var info = await susersModel.findOne({susername});
    
    if(!info){
        return res.json({
            code:-1,
            errmsg:'用户名不存在'
        })
    }else{      
        if(info.supassword!==getCrypto(password)){
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
            const token = JWT.sign({
                susername
            },
            'helloworld',
            {
                expiresIn:'7d'
            })
            return res.json({
                code:0,
                errmsg:'验证通过',
                susername,
                token
            })
        }
    }
}
//管理用户模块
var getUsersList = async (req,res,next)=>{
    if(req.headers["authorization"]){
        const token = req.headers["authorization"].replace("Bearer","").trim();
        var result = JWT.verify(token,"helloworld");
        const {page,count} = req.query;
        var arr = await usersModel.find();
        var infos = await usersModel.find().skip((Number(page)-1)*Number(count)).limit(Number(count));
        var total =arr.length;
        if(!infos&&!result){
            res.josn({
                code:-2,
                errmsg:'向数据库获取数据失败，请重试'
            })
        }
        else{
            res.json({
                err:0, 
                errmsg:'获取用户列表成功',
                total,
                infos
            })
        }
    }
    else{
        res.json({
            code:-1,
            errmsg:'获取用户列表失败,请检查是否处于登录状态'
        })
    }
}
var removeUser =  async (req,res,next)=>{
    if(!req.headers["authorization"]){
        return res.json({
            code:-1,
            errmsg:'没有检测到登录令牌，请检查是否处于登录状态'
        })
    }
    else{
        const token = req.headers["authorization"].replace(/Bearer/,"").trim();
        JWT.verify(token,"helloworld",async function(err,decoded){
            if(err){
                return res.json({
                    code:0,
                    errmsg:'登录令牌验证失败'
                })
            }
            else{
                const uid = req.query.uid;
                var {username} = await usersModel.findOne({uid});
                
                Promise.all([
                    usersModel.deleteOne({uid}),
                    questionModel.remove({qfrom:username}),
                    answerModel.remove({afrom:username}),
                    commentModel.remove({cfrom:uid})
                ]).then(suc=>{
                    res.json({
                        code:0,
                        errmsg:'删除成功'
                    })
                }).catch(err=>{
                    res.json({
                        code:-3,
                        errmsg:"数据库操作失败"
                    })
                })
            }
        })
    }
}
//管理问题模块
var getQuestionsList = async (req,res,next)=>{
    if(!req.headers["authorization"]){
        return req.json({
            code:-1,
            errmsg:'没有检测到登录令牌'
        })
    }
    else{
        const token  = req.headers["authorization"].replace(/Bearer/,"").trim();
        try{
            const result = JWT.verify(token,"helloworld");
        }catch(err){
            return res.json({
                code:-2,
                errmsg:'登录令牌验证失败'
            })
        }
    }

    const username = req.query.username;

    if(username === 'all'){
        const infos = await questionModel.find();
        return res.json({
            code:0,
            errmsg:'获取问题成功',
            questions:infos
        })
    }
    else{
        const questions = await questionModel.find({qfrom:username});
        if(questions.length===0){
           res.json({
               code:0,
               errmsg:'获取问题成功',
               questions:[]
           })
        }
        else{
            res.json({
                code:0,
                errmsg:'获取问题成功',
                questions
            })
        }
    }  
    
    
}
//管理回答模块
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
            const user = await usersModel.findOne({username:info.afrom})
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
//管理评论模块
var getComments = async (req,res,next)=>{
    // if(!req.headers["authorization"]){
    //     return res.json({
    //         code:-1,
    //         errmsg:'未检测到登录令牌，请检查是否处于登录状态'
    //     })
    // }
    // const token = req.headers["authorization"].replace(/Bearer/,"").trim();
    // JWT.verify(token,'helloworld',async function(err,decoded){
    //     if(err){
    //         return res.json({
    //             code:-2,
    //             errmsg:'登录令牌验证失败'
    //         })
    //     }
    //     else{
            const {aid} = req.query;
            var infos = await commentModel.find({cfor:Number(aid)});
           
            if(!infos){
                return res.json({
                    code:-3,
                    errmsg:'数据库操作失败'
                })
            }
            else{
                var arr = infos.map((item,index)=>{
                    return {
                        ccontent:item.ccontent,
                        username:item.cfrom
                    }
                })
                return res.json({
                    code:0,
                    errmsg:'ok',
                    comments:arr                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   

                })
            }
    //     }
    // })
}

module.exports = {register,login,getUsersList,getQuestionsList,getQanswers,getComments,removeUser}