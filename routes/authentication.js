const passport = require("passport");
require("../config/passport")(passport);
const {
    isLoggedIn,
    isLoggedOut,
    ensureAdmin
} = require("../config/auth");

const express = require("express");
var db = require("../config/db-config");
const router = express.Router();
const moment = require('moment');
const bcrypt = require("bcryptjs");


//signup page
router.get("/signup", (req, res) => {
    res.render("signup", { message: req.flash("success"), layout: 'blank_layout' });
});

//create user
router.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    if (!username || !password || !password2) {
        req.flash("error", "Please enter all fields");
        res.redirect("/signup");
    } else if (password != password2) {
        req.flash("error", "Password do not match");
        res.redirect("/signup");
    } else if (password.length < 6) {
        req.flash("error", "Password atleast 6 character");
        res.redirect("/signup");
    } else {
        try {
            var sql = 'SELECT * FROM application_users WHERE username =?';
            db.query(sql, username, function (error, result) {
                if (error)
                    return res.status(500).send(error.sqlMessage);
                if (result.length > 0) {
                    req.flash("error", "Username not available");
                    res.redirect("/signup");
                }
                else {
                    bcrypt.hash(password, 10, (err, hash) => {
                        if (err) throw err;
                        const hash_password = hash;

                        const userDet = {
                            name: req.body.name,
                            username: username,
                            password: hash_password,
                            typ: req.body.typ,
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                        };

                        var query = "INSERT IGNORE INTO application_users SET ?";
                        db.query(query, userDet, function (error, result) {
                            if (error) throw error;
                            if (result.affectedRows > 0) {
                                req.flash("success", "Successfully created");
                                res.redirect("/signup");
                            } else res.status(500).send(false);
                        });
                    });
                }
            });

        } catch (error) {
            console.log(error);
        }
    }
});

//login page
router.get("/login", isLoggedOut, (req, res) => {
    res.render("login", { message: req.flash("success"), layout: 'blank_layout' });
});

router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/login",
    })
),
    router.get("/home", isLoggedIn, (req, res) => {
        req.flash("success", "You are now logged in!");
        if(req.user.typ =="STUDENT"){
            return res.redirect("/");
        }
        else if(req.user.typ =="TUTOR"){
            return res.redirect("/tutor/dashboard");
        }
        else if(req.user.typ =="HOD"){
            return res.redirect("/hod/dashboard");
        }
        else if(req.user.typ =="PRINCIPAL"){
            return res.redirect("/principal/dashboard");
        }

    });

router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logout successfull");
        res.redirect("/login");
    });
});


module.exports = router;