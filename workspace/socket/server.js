// サーバーに必要なモジュールを読み込み
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cookieParser = require('cookie-parser');
const passport = require('passport');

//mongodbモジュール読み込み,初期化
const mongo = require('./lib/mongo');
//mongo.init();

// socket.ioモジュールを読み込み
const io = require('socket.io')(server);
const socket = require('./lib/socket');

// 80番のポート開放
const port = process.env.PORT || 80;

// appの初期設定
app.use(cookieParser());
app.use(express.static('public'));

// session
const session = require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxage: 1000 * 60 * 30,
    }
});

app.use(session);

// CORS対策
app.use(function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// socketにsessionを渡す
const socket_io_session = function (session, passport) {
    return {
        express_session:
            (socket, next) => { session(socket.request, {}, next) },
        passport_initialize:
            (socket, next) => { passport.initialize()(socket.request, {}, next) },
        passport_session:
            (socket, next) => { passport.session()(socket.request, {}, next) }
    }
}(session, passport);

io.use(socket_io_session.express_session);
io.use(socket_io_session.passport_initialize);
io.use(socket_io_session.passport_session);

// クライアント側とコネクション確立
io.on('connection', socket.onConnection(io));

// サーバー起動
server.listen(port);