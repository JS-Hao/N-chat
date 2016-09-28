var router = require('express').Router();

router.get('/', function(req, res) {
	if (req.cookies.user === null) {
		res.redirect('/signin');
	} else {
		res.render('index', {title: '欢迎来到聊天室'});
	}
});

router.get('/signin', function(req, res) {
	res.render('signin', {info: ''});
});

router.post('/signin', function(req, res) {
	//若存在，则不允许登录
	if (users[req.body.name]) {
		res.render('signin', {
			info: '该用户已在线！'
		});
	} else {
		res.cookie('user', req.body.name, {maxAge: 1000*60*60*24*30});
		res.render('index', {title: '欢迎来到聊天室'});
	}
});

module.exports = router;