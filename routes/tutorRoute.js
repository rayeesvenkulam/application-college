var express = require('express');
var router = express.Router();
const { ensureTutor } = require("../config/auth");
const multer = require('multer');
var db = require("../config/db-config");

/* GET home page. */
router.get('/dashboard', ensureTutor, function (req, res, next) {
  res.render('tutor/dashboard', { layout: 'tutor/tutor_layout' });
});

router.get('/applications', ensureTutor, function (req, res, next) {
  var sql = "SELECT c.*,s.name,t.type_name FROM application_certificate c, application_students s, application_types t WHERE c.tutor_id=? AND c.student_id=s.user_id AND c.application_type = t.id";
  db.query(sql, req.user.id, function (error, result) {
    if (error) throw error;
    res.render('tutor/applications', { data: { applications: result }, layout: 'tutor/tutor_layout' });
  });
});

router.get('/application/view', ensureTutor, function (req, res, next) {
  var sql = "SELECT c.id,c.description,c.request_date,c.request_files,s.name,s.branch,s.semester,s.adm_number,s.adm_year,s.quota,s.university_no,s.mobile1,s.mobile2,t.type_name FROM application_certificate c, application_students s, application_types t WHERE c.id=? AND c.student_id=s.user_id AND c.application_type = t.id; SELECT id,name FROM application_users WHERE typ='HOD' AND stat != true;";
  db.query(sql, req.query.id, function (error, result) {
    if (error) throw error;
    res.render('tutor/view_application', { data: { application: result[0] }, layout: 'tutor/tutor_layout' });
  });
});

router.post('/application/approve-reject', ensureTutor, function (req, res, next) {

  console.log(req.body);
  let status;
  let reviewer;
  if (req.body.action == "approve") {
    status = "Approved by Tutor";
    reviewer = "HOD";
  }
  else {
    status = "Rejected by Tutor";
    reviewer = "Student";
  }

  const data = {
    "hod_id": req.body.hod,
    "tutor_comments": req.body.comment,
    "status": status,
    "current_reviewer": reviewer
  }
  var sql = "UPDATE application_certificate SET ? WHERE id=?";
  db.query(sql, [data, req.body.id], function (error, result) {
    if (error) throw error;
    if (result.affectedRows > 0) {
      var sql1 = "SELECT c.*,s.name,t.type_name FROM application_certificate c, application_students s, application_types t WHERE c.tutor_id=? AND c.student_id=s.user_id AND c.application_type = t.id";
      db.query(sql1, req.user.id, function (error, result1) {
        if (error) throw error;
        req.flash("success", "You are now logged in!");
        res.render('tutor/applications', { data: { applications: result1 }, layout: 'tutor/tutor_layout' });
      });
    }
  });
});


module.exports = router;
