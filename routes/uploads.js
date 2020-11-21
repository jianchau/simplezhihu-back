var express = require('express');
var multer = require('multer');
var upload = multer({dest:'uploads/'})
var router = express.Router();
var path = require('path')
var controllerAppAnswer = require('../controller/controllerApp/answer')
var controllerAppQuestion = require('../controller/controllerApp/question')
var controllerAppUser = require('../controller/controllerApp/user')
var getYZM = require('../common/getYZM');
const { ifError } = require('assert');
/* GET home page. */

router.get('/:url',function(req,res,next){
    var rurl= req.params.url;
    res.sendFile(rurl,{root:'uploads'},function(err,res){
        if(err){
            console.log(err)
        }
    })
})
module.exports = router;

