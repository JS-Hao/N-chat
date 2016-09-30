var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var router = express.Router();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 储存在线用户列表对象
var users = {};

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
  console.log(req.body.name);
  //若存在，则不允许登录
  if (users[req.body.name]) {
    res.render('signin', {
      info: '该用户已在线！'
    });
  } else {
    res.cookie('user', req.body.name, {maxAge: 1000*60*60*24*30});
    res.cookie('photo', req.body.photo, {maxAge: 1000*60*60*24*30});
    res.redirect('/');
  }
});

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var server = http.createServer(app);

/* socket */
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
  socket.on('online', function(data) {
    //将上线用户名存储为socket对象的属性，用来做每个socket的id识别
    socket.name = data.user;
    if (!users[data.user]) {
      users[data.user] = data.user;
    }
    //向所有用于广播该用户已上线
    io.sockets.emit('online', {users: users, user: data.user});
  });

  socket.on('say', function(data) {
    if (data.to === 'all') {
      //向其他所有用户广播该用户发话信息；
      socket.broadcast.emit('say', data);
    } else {
      var clients = io.sockets.sockets;
      for (client in clients) {
        if (clients[client].name === data.to) {
          clients[client].emit('say', data);
        }
      }
    }
  })
});

server.listen(3000, function() {
  console.log('server is running!');
});


module.exports = app;
