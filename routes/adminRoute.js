var express = require('express');
var router = express.Router();
const { ensureAdmin } = require("../config/auth");
var db = require("../config/db-config");
const moment = require('moment');
const bcrypt = require("bcryptjs");

/* GET home page. */
router.get('/dashboard', ensureAdmin, function (req, res, next) {
    res.render('admin/dashboard', { layout: 'admin/admin_layout' });
});

router.get('/users', ensureAdmin, function (req, res, next) {
    var sql = "SELECT * FROM application_users WHERE typ !='ADMIN'";
    db.query(sql, req.user.id, function (error, result) {
        if (error) throw error;
        res.render('admin/users', { data: { users: result }, layout: 'admin/admin_layout' });
    });
});

router.get('/users/create', ensureAdmin, function (req, res, next) {
    res.render('admin/user_create', { layout: 'admin/admin_layout' });
});

// router.get('/users/delete', ensureAdmin, function (req, res, next) {
//     var sql1 = "SELECT * FROM application_users WHERE student_id=? OR tutor_id=? OR hod_id=? OR ";
//     db.query(sql1, req.user.id, function (error, result1) {
//         if (error) throw error;

//     });

//     var sql = "DELETE c.id,c.description,c.request_date,c.request_files,s.name,s.branch,s.semester,s.adm_number,s.adm_year,s.quota,s.university_no,s.mobile1,s.mobile2,t.type_name FROM application_certificate c, application_students s, application_types t WHERE c.id=? AND c.student_id=s.user_id AND c.application_type = t.id; SELECT id,name FROM application_users WHERE typ='HOD' AND stat != true;";
//     db.query(sql, req.query.id, function (error, result) {
//         if (error) throw error;
//         let imgArray = JSON.parse(result[0][0].request_files);
//         res.render('tutor/view_application', { data: { application: result[0][0], hod: result[1], images: imgArray }, layout: 'tutor/tutor_layout' });
//     });
// });

router.post('/users/create', ensureAdmin, function (req, res, next) {
    // console.log(req.body); return;

    if (req.body.password !== req.body.cpassword) {
        req.flash("error", "Password and Confirm Password not same!");
        return res.render('admin/user_create', { layout: 'admin/admin_layout' });
    }
    else if (req.body.type == "PRINCIPAL") {
        var sql2 = "SELECT * FROM application_users WHERE typ ='PRINCIPAL'";
        db.query(sql2, function (error, result2) {
            if (error) throw error;
            if (result2.length > 0) {
                req.flash("error", "Principal user already available!");
                return res.render('admin/user_create', { layout: 'admin/admin_layout' });
            }
        });
    }
    else if (req.body.type == "OFFICE") {
        var sql3 = "SELECT * FROM application_users WHERE typ ='OFFICE'";
        db.query(sql3,function (error, result3) {
            if (error) throw error;
            if (result3.length > 0) {
                req.flash("error", "Office user already available!");
                return res.render('admin/user_create', { layout: 'admin/admin_layout' });
            }
        });
    }

    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) throw err;
        const hash_password = hash;

        const userDet = {
            name: req.body.name,
            username: req.body.username,
            password: hash_password,
            typ: req.body.type,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss')
        };

        var query = "INSERT IGNORE INTO application_users SET ?";
        db.query(query, userDet, function (error, result) {
            if (error) throw error;
            if (result.affectedRows > 0) {
                if (req.body.type == "STUDENT") {
                    const data = {
                        user_id: result.insertId,
                        name: req.body.name,
                        branch: req.body.branch,
                        semester: req.body.semester,
                        adm_number: req.body.adm_no,
                        adm_year: req.body.adm_year,
                        quota: req.body.quota,
                        university_no: req.body.university_no,
                        mobile1: req.body.mobile1,
                        mobile2: req.body.mobile2

                    };

                    var query1 = "INSERT IGNORE INTO application_students SET ?";
                    db.query(query1, data, function (error, result1) {
                        if (error) throw error;
                        if (result1.affectedRows > 0) {
                            req.flash("success", "Successfully created");
                            res.redirect("admin/user_create");
                        } else {
                            req.flash("error", "Error");
                            return res.render('admin/user_create', { layout: 'admin/admin_layout' });
                        }
                    });
                }
                else {
                    req.flash("success", "Successfully created");
                    res.redirect("admin/user_create");
                }

            } else {
                req.flash("error", "Error");
                return res.render('admin/user_create', { layout: 'admin/admin_layout' });
            }
        });
    });

});


module.exports = router;
