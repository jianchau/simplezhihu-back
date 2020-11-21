var mongoose = require('mongoose');

var answerSchema = mongoose.Schema({
    aid:{
        type:Number,required:true
    },
    afrom:{
        type:String,required:true
    },
    afor:{
        type:Number,required:true  
    },
    adetail:{
        type:String,required:true
    },
    alikes:{
        type:Number,required:true,default:0
    }
})

var answerModel = mongoose.model("answers",answerSchema)

module.exports = answerModel;