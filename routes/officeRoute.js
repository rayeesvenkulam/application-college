var express = require('express');
var router = express.Router();
const { ensureOffice } = require("../config/auth");
var db = require("../config/db-config");
const multer = require('multer');
const moment = require('moment');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, "/" + file.fieldname + "_" + Date.now() + file.originalname);
  }
});

const upload = multer({ storage: storage });

/* GET home page. */
router.get('/dashboard', ensureOffice, function (req, res, next) {
  res.render('office/dashboard', { layout: 'office/office_layout' });
});

router.get('/applications', ensureOffice, function (req, res, next) {
  var sql = "SELECT c.*, s.name, t.type_name, ut.name AS tutor, uh.name AS hod FROM application_certificate c JOIN application_students s ON c.student_id = s.user_id JOIN application_types t ON c.application_type = t.id JOIN application_users ut ON c.tutor_id = ut.id JOIN application_users uh ON c.hod_id = uh.id WHERE c.current_reviewer = 'Office';";
  db.query(sql, function (error, result) {
    if (error) throw error;
    res.render('office/applications', { data: { applications: result }, layout: 'office/office_layout' });
  });
});

router.get('/application/view', ensureOffice, function (req, res, next) {
  var sql = "SELECT c.id, c.description, c.request_date, c.request_files, s.name, u1.name AS tutor, u2.name AS HOD, s.branch, s.semester, s.adm_number, s.adm_year, s.quota, s.university_no, s.mobile1, s.mobile2, t.type_name FROM application_certificate c JOIN application_students s ON c.student_id=s.user_id JOIN application_users u1 ON c.tutor_id=u1.id JOIN application_users u2 ON c.hod_id=u2.id JOIN application_types t ON c.application_type=t.id WHERE c.id = ?;";
  db.query(sql, req.query.id, function (error, result) {
    if (error) throw error;
    let imgArray = JSON.parse(result[0].request_files);
    res.render('office/view_application', { data: { application: result[0],  images:imgArray}, layout: 'office/office_layout' });
  });
});

router.post('/application/issue', ensureOffice, upload.single('file'), function (req, res, next) {

  const data = {
    "office_staff_comments": req.body.comment,
    "status": 'Issued by Office',
    "current_reviewer": 'Issued',
    "issued_file":'/uploads'+req.file.filename
  }
  var sql = "UPDATE application_certificate SET ? WHERE id=?";
  db.query(sql, [data, req.body.id], function (error, result) {
    if (error) throw error;
    if (result.affectedRows > 0) {
      var sql1 = "SELECT c.*, s.name, t.type_name, ut.name AS tutor, uh.name AS hod FROM application_certificate c JOIN application_students s ON c.student_id = s.user_id JOIN application_types t ON c.application_type = t.id JOIN application_users ut ON c.tutor_id = ut.id JOIN application_users uh ON c.hod_id = uh.id WHERE c.current_reviewer = 'Office';";
      db.query(sql1, req.user.id, function (error, result1) {
        if (error) throw error;
        req.flash("success", "Issued Successfully!");
        res.render('office/applications', { data: { applications: result1 }, layout: 'office/office_layout' });
      });
    }
  });
});


module.exports = router;
