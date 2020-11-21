var mongoose = require('mongoose');
var usersschema = mongoose.Schema({
    uid:{type:Number,required:true,default:0},
    username:{type:String,required:true},
    upassword:{type:String,required:true},
    uavatar:{type:String,default:'https://dss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3790034832,2705828409&fm=26&gp=0.jpg'}
})
var usersmodel = mongoose.model('users',usersschema);

module.exports = usersmodel