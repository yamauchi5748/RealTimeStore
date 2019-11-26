const express = require('express');
const router = express.Router();
const Authenticator = require("./Authenticator");

const passport = require('passport');

function isAuthenticated(req, res, next) {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {  // 認証済
        return next();
    }
    else {  // 認証されていない
        res.redirect('/login');  // ログイン画面に遷移
    }
}

router.get('/', Authenticator.isAuthenticated, function (req, res, next) {
    res.json('成功');
});

router.get('/login', function (req, res, next) {
    res.json('失敗');
});
router.post("/login", (req, res, next) => {
    Authenticator.authenticate(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;