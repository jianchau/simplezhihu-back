var express = require('express');
var router = express.Router();
var controllerCms = require('../controller/controllerCms')
var getYZM = require('../common/getYZM')
/* GET users listing. */

//suser模块
router.post('/register', controllerCms.register);
router.post('/login',controllerCms.login)

//管理user模块
router.get('/userslist',controllerCms.getUsersList)
router.get('/removeuser',controllerCms.removeUser)

//管理问题模块
router.get('/questionslist',controllerCms.getQuestionsList)
//管理回答模块
router.get('/qanswers',controllerCms.getQanswers)
//管理评论模块
router.get('/comments',controllerCms.getComments)
//其他模块
router.get('/yzm',getYZM)

module.exports = router;
