var mongoose = require('mongoose');
var susersschema = mongoose.Schema({
    suid:{type:Number,required:true,default:0},
    susername:{type:String,required:true},
    supassword:{type:String,required:true}
})
var susersmodel = mongoose.model('susers',susersschema);

module.exports = susersmodel