var express = require('express');
var multer = require('multer');
var upload = multer({dest:'uploads/'})
var router = express.Router();
var controllerAppAnswer = require('../controller/controllerApp/answer')
var controllerAppQuestion = require('../controller/controllerApp/question')
var controllerAppUser = require('../controller/controllerApp/user')
var controllerComment = require('../controller/controllerApp/comment')
var controllerLike = require('../controller/controllerApp/like')
var getYZM = require('../common/getYZM')
/* GET home page. */

// user模块
router.post('/register',controllerAppUser.register);
router.post('/login',controllerAppUser.login);
router.get('/mine',controllerAppUser.GetMineInfo)
router.post('/changeavatar',upload.single('file'),controllerAppUser.changeAvatar)

//question模块
router.post('/addquestion',controllerAppQuestion.addquestion)
router.get('/questionslist',controllerAppQuestion.getQuestionsList)

//answer模块
router.post('/addanswer',controllerAppAnswer.addAnswer)
router.get('/qanswers',controllerAppAnswer.getQanswers)


//comment模块
router.post('/addcomment',controllerComment.addComment)
router.get('/comments',controllerComment.getComment)
//like模块
router.get('/like',controllerLike.likeAnswer)
//其他模块
router.get('/yzm',getYZM)

module.exports = router;
