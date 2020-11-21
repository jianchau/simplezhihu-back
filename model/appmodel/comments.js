var mongoose = require('mongoose');
var commentSchema = mongoose.Schema({
    cid:{
        type:Number,required:true
    },
    cfrom:{
        type:String,required:true
    },
    cfor:{
        type:Number,required:true   
    },
    ccontent:{
        type:String,
        required:true
    },
    ctime:{
        type:String,
        required:true
    }
})
var commentModel = mongoose.model('comments',commentSchema)

module.exports = commentModel;