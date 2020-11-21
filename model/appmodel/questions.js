var mongoose = require('mongoose');

var questionSchema = mongoose.Schema({
    qid:{type:Number,required:true},
    qfrom:{type:String,required:true},
    qcontent:{type:String,required:true},
    qtime:{type:Date,required:true}
});

var questionModel = mongoose.model('questions',questionSchema);

module.exports = questionModel;