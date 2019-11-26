const passport = require("passport");
const LocalStrategy = require("passport-local");
const authSetting = require("../config/auth.json");
const user = require("./user");

class Authenticator {
    initialize(app) {
        // passportの初期化
        app.use(passport.initialize());

        // セッション管理をするための設定
        app.use(passport.session());

        // ログイン成功後指定されたオブジェクトをシリアライズして保存する際の
        // シリアライズ処理をフックするもの
        passport.serializeUser((user, done) => {
            console.log('user', user);
            return done(null, user);
        });

        passport.deserializeUser((serializedUser, done) => {
            // mongoDBから指定したユーザIDの情報を取得する
            user.get(serializedUser.user_id)
                .then(user => {
                    console.log('aaa',user);
                    // 認証に成功したらidを返す
                    return done(null, {
                        user_id: user._id
                    });
                })
                .catch(() => {
                    console.log('hueeeee')
                    return done(null, false);
                });
        });
    }

    setStrategy() {
        // passport.use：ストラテジーの設定
        // ストラテジー：ユーザIDとパスワードを用いた懸賞やOAuthを用いた権限付与、OpenIDを用いた分散認証を実装する
        // localStrategy：ユーザIDとパスワードを用いた認証の実装部分
        passport.use(
            new LocalStrategy(
                {
                    usernameField: authSetting.usernameField,
                    passwordField: authSetting.passwordField,
                    passReqToCallback: true
                },
                (req, user_id, password, done) => {
                    console.log('hutototo',req.user);
                    user.authorize(user_id, password)
                        .then(user => {
                            console.log('きたあああ', user);
                            // 認証に成功したらユーザ情報を返す
                            return done(null, user);
                        })
                        .catch(err => {
                            return done(null, false);
                        });
                }
            )
        );
    }

    authenticate(req, res, next) {
        // 認証情報を参照
        passport.authenticate(authSetting.strategyName, {
            // ログインに成功した時のリダイレクト先
            successRedirect: Authenticator.redirect.success,
            // ログインに失敗した時のリダイレクト先
            failureRedirect: Authenticator.redirect.failure,
            // session 扱う
            session: true
        })(req, res, next);
    }

    // 認証が完了しているか確認(routes内で使う)
    isAuthenticated(req, res, next) {
        console.log(req);
        // 認証が完了している時は次の処理に進む
        if (req.isAuthentocated()) {
            return next();
        } else {
            // 認証が終わっていなかったらログイン画面にリダイレクトする
            return res.redirect(Authenticator.redirect.failure);
        }
    }
}

module.exports = new Authenticator();

Authenticator.redirect = {
    success: "/",
    failure: "/login",
    permission: "/"
};