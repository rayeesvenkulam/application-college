var express = require('express');
var router = express.Router();
const { ensureHod } = require("../config/auth");
var db = require("../config/db-config");

/* GET home page. */
router.get('/dashboard', ensureHod, function (req, res, next) {
  res.render('hod/dashboard', { layout: 'hod/hod_layout' });
});

router.get('/applications', ensureHod, function (req, res, next) {
  var sql = "SELECT c.*,s.name,u.name AS tutor,t.type_name FROM application_certificate c, application_students s, application_types t, application_users u WHERE c.hod_id=? AND c.current_reviewer='HOD' AND c.student_id=s.user_id AND c.tutor_id=u.id AND c.application_type = t.id";
  db.query(sql, req.user.id, function (error, result) {
    if (error) throw error;
    res.render('hod/applications', { data: { applications: result }, layout: 'hod/hod_layout' });
  });
});

router.get('/application/view', ensureHod, function (req, res, next) {
  var sql = "SELECT c.id, c.tutor_comments, c.description,c.request_date,c.request_files,s.name,u.name AS tutor,s.branch,s.semester,s.adm_number,s.adm_year,s.quota,s.university_no,s.mobile1,s.mobile2,t.type_name FROM application_certificate c,application_users u, application_students s, application_types t WHERE c.id=? AND c.student_id=s.user_id AND c.tutor_id=u.id AND c.application_type = t.id;";
  db.query(sql, req.query.id, function (error, result) {
    if (error) throw error;
    let imgArray = JSON.parse(result[0].request_files);
    res.render('hod/view_application', { data: { application: result[0],  images:imgArray}, layout: 'hod/hod_layout' });
  });
});

router.post('/application/approve-reject', ensureHod, function (req, res, next) {

  let status;
  let reviewer;
  if (req.body.action == "approve") {
    status = "Approved by HOD";
    reviewer = "Principal";
  }
  else {
    status = "Rejected by HOD";
    reviewer = "Tutor";
  }

  const data = {
    "hod_comments": req.body.comment,
    "status": status,
    "current_reviewer": reviewer
  }
  var sql = "UPDATE application_certificate SET ? WHERE id=?";
  db.query(sql, [data, req.body.id], function (error, result) {
    if (error) throw error;
    if (result.affectedRows > 0) {
      var sql1 = "SELECT c.*,s.name,u.name AS tutor,t.type_name FROM application_certificate c, application_students s, application_types t, application_users u WHERE c.hod_id=? AND c.current_reviewer='HOD' AND c.student_id=s.user_id AND c.tutor_id=u.id AND c.application_type = t.id";
      db.query(sql1, req.user.id, function (error, result1) {
        if (error) throw error;
        req.flash("success", "Added Successfully!");
        res.render('hod/applications', { data: { applications: result1 }, layout: 'hod/hod_layout' });
      });
    }
  });
});


module.exports = router;
