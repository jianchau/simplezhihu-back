var usersmodel = require('../../model/appmodel/users');
var countermodel  = require('../../model/countermodel/counters')
var questionModel = require('../../model/appmodel/questions')
var answerModel =  require('../../model/appmodel/answers')
var commentModel = require('../../model/appmodel/comments')
var getCrypto = require('../../common/crypto')
var JWT = require('jsonwebtoken')

var addquestion =async (req,res,next)=>{
    const token = req.headers["authorization"].replace("Bearer ", "");
    const result = JWT.verify(token, "helloworld"); 
    var qfrom = result.username;
    var {qcontent} = req.body;
    var {qid} = await countermodel.findOneAndUpdate({},{$inc:{qid:1}},{upsert:true,new:true,useFindAndModify:false});
    var qtime = Date.now();
    var data = {
        qid:Number(qid),
        qfrom,
        qcontent,
        qtime
    }
    var info = await questionModel(data).save();
    if(!info){
        return res.json({
            code:-1,
            errmsg:'添加问题失败'
        })
    }else{
        return res.json({
            code:0,
            errmsg:'添加问题成功',
            qid
        })
    }
}

var getQuestionsList =  async (req,res,next)=>{
    if(!req.headers["authorization"]){
        res.json({
            code:-1,
            errmsg:'获取数据失败，请检查是否处于登录状态'
        })
    }
    else{
        const token = req.headers["authorization"].replace("Bearer","").trim();
        var result = JWT.verify(token,"helloworld");
        if(!result){
            res.json({
                code:-2,
                errmsg:'验证身份失败'
            })
        }
        else{
            const infos = await questionModel.find();    
            const arr = await Promise.all(infos.map((item) =>{
                return answerModel.findOne({  
                    afor:item.qid
                })
            }));
            const arr2 = await Promise.all(arr.map(async (info, index)=>{
                if(!info){ 
                    return Promise.resolve( {
                        qcontent:infos[index].qcontent,
                        qid:infos[index].qid,
                        username:infos[index].qfrom,
                        first_answer:[]
                    })  
                }
                else{                              
                    const coms = await commentModel.find({cfor:info.aid});
                    first_answer={
                        adetail:info.adetail,
                        comslength:coms.length
                    }                          
                    return Promise.resolve({
                        qcontent:infos[index].qcontent,
                        qid:infos[index].qid,
                        username:infos[index].qfrom,
                        first_answer,
                    })  
                }
            }))

            const arr3 = await Promise.all(arr2.map(async (item,index)=>{
                const info = await usersmodel.findOne({username:item.username});
                if(!info){
                    return Promise.resolve({
                        qcontent:item.qcontent,
                        qid:item.qid,
                        first_answer,
                        username:'该用户已被删除',
                    })
                }
                else{
                    const uavatar = info.uavatar;
                    return Promise.resolve({
                        ...item,
                        uavatar,
                    })
                }
              
            }))

            res.json({
            code:0,
            errmsg:'请求成功',
            questions :arr3           
            })    
        }
    } 
}

module.exports = {addquestion,getQuestionsList}