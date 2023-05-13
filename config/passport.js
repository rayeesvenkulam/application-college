const LocalStrategy = require("passport-local").Strategy;
var db = require("../config/db-config");
const bcrypt = require("bcryptjs");

module.exports = function (passport) {

    passport.use(
        new LocalStrategy(function (username, password, done) {
            var sql = "SELECT * FROM application_users WHERE username =?";
            db.query(sql, username, function (error, result) {
                if (error) return res.status(500).send(error.sqlMessage);
                if (result.length == 0)
                    return done(null, false, { message: "Incorrect username." });

                // Match password
                bcrypt.compare(password, result[0].password, (err, isMatch) => {
                    if (err) throw err;

                    if (isMatch) {
                        return done(null, result[0]);
                    } else {
                        return done(null, false, {
                            message: "Invalid username or password",
                        });
                    }
                });
            });
        })
    );

    passport.serializeUser(function (user, done) {
        done(null, user.username);
    });

    passport.deserializeUser(function (name, done) {
        var sql = "SELECT * FROM application_users WHERE username=?";
        db.query(sql, name, function (error, result) {
            if (error) return res.status(500).send(error.sqlMessage);
            done(error, result[0]);
        });
    });
};
