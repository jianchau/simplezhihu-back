var mongoose = require('mongoose');

var counterschema = mongoose.Schema({
    aid:{type:Number,default:0},
    suid:{type:Number,default:0},
    uid:{type:Number,default:0},
    qid:{type:Number,default:0},
    cid:{type:Number,default:0}
})
var countermodel = mongoose.model('counters',counterschema)

module.exports = countermodel