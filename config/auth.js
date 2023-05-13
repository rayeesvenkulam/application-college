module.exports = {
    isLoggedIn: function (req, res, next) {
        if (req.isAuthenticated()) return next();
        else {
            req.flash("error", "Unauthorized request. Please login");
            res.redirect("/login");
        }
    },

    isLoggedOut: function (req, res, next) {
        if (!req.isAuthenticated()) return next();
        else {
            req.flash("error", "Already signed in");
            res.redirect("/");
        }
    },
    // ensureAdmin: function (req, res, next) {
    //     if (req.isAuthenticated()) {
    //         if (req.user.Typ == "ADMIN") {
    //             return next();
    //         }
    //         else {
    //             res.status(403).send("Access Denied");
    //         }
    //     }
    //     else {
    //         res.status(403).send("Access Denied");
    //     }
    // },

    ensureTutor: function (req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.typ == "TUTOR") {
                return next();
            }
            else {
                req.flash("error", "Unauthorized request. Please login");
                res.redirect("/login");
            }
        }
        else {
            req.flash("error", "Unauthorized request. Please login");
            res.redirect("/login");
        }
    },

    ensureStudent: function (req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.typ == "STUDENT") {
                return next();
            }
            else {
                req.flash("error", "Unauthorized request. Please login");
                res.redirect("/login");
            }
        }
        else {
            req.flash("error", "Unauthorized request. Please login");
            res.redirect("/login");
        }
    },

    // ensureNotUser: function (req, res, next) {
    //     if (req.isAuthenticated()) {
    //         if (req.user.Typ != "USER") {
    //             return next();
    //         }
    //         else {
    //             res.status(403).send("Access Denied");
    //         }
    //     }
    //     else {
    //         res.status(403).send("Access Denied");
    //     }
    // },

    // isDeveloper: function (req, res, next) {
    //     if (req.isAuthenticated()) {
    //         if (req.user.Typ == "DEVELOPER") {
    //             return next();
    //         }
    //         else {
    //             res.status(403).send("Access Denied");
    //         }
    //     }
    //     else {
    //         res.status(403).send("Access Denied");
    //     }
    // },


}