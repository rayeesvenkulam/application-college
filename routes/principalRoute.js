var express = require('express');
var router = express.Router();
const { ensurePrincipal } = require("../config/auth");
var db = require("../config/db-config");

/* GET home page. */
router.get('/dashboard', ensurePrincipal, function (req, res, next) {
  res.render('principal/dashboard', { layout: 'principal/principal_layout' });
});

router.get('/applications', ensurePrincipal, function (req, res, next) {
  var sql = "SELECT c.*, s.name, t.type_name, ut.name AS tutor, uh.name AS hod FROM application_certificate c JOIN application_students s ON c.student_id = s.user_id JOIN application_types t ON c.application_type = t.id JOIN application_users ut ON c.tutor_id = ut.id JOIN application_users uh ON c.hod_id = uh.id WHERE c.current_reviewer = 'Principal';";
  db.query(sql, function (error, result) {
    if (error) throw error;
    res.render('principal/applications', { data: { applications: result }, layout: 'principal/principal_layout' });
  });
});

router.get('/application/view', ensurePrincipal, function (req, res, next) {
  var sql = "SELECT c.id,c.tutor_comments,c.hod_comments, c.description, c.request_date, c.request_files, s.name, u1.name AS tutor, u2.name AS HOD, s.branch, s.semester, s.adm_number, s.adm_year, s.quota, s.university_no, s.mobile1, s.mobile2, t.type_name FROM application_certificate c JOIN application_students s ON c.student_id=s.user_id JOIN application_users u1 ON c.tutor_id=u1.id JOIN application_users u2 ON c.hod_id=u2.id JOIN application_types t ON c.application_type=t.id WHERE c.id = ?;";
  db.query(sql, req.query.id, function (error, result) {
    if (error) throw error;
    let imgArray = JSON.parse(result[0].request_files);
    res.render('principal/view_application', { data: { application: result[0],  images:imgArray}, layout: 'principal/principal_layout' });
  });
});

router.post('/application/approve-reject', ensurePrincipal, function (req, res, next) {

  let status;
  let reviewer;
  if (req.body.action == "issuedOffice") {
    status = "Approved by Principal";
    reviewer = "Office";
  }
  else if(req.body.action == "issued"){
    status = "Issued by Principal";
    reviewer = "Issued";
  }
  else {
    status = "Rejected by Principal";
    reviewer = "HOD";
  }

  const data = {
    "principal_comments": req.body.comment,
    "status": status,
    "current_reviewer": reviewer
  }
  var sql = "UPDATE application_certificate SET ? WHERE id=?";
  db.query(sql, [data, req.body.id], function (error, result) {
    if (error) throw error;
    if (result.affectedRows > 0) {
      var sql1 = "SELECT c.*, s.name, t.type_name, ut.name AS tutor, uh.name AS hod FROM application_certificate c JOIN application_students s ON c.student_id = s.user_id JOIN application_types t ON c.application_type = t.id JOIN application_users ut ON c.tutor_id = ut.id JOIN application_users uh ON c.hod_id = uh.id WHERE c.current_reviewer = 'Principal';";
      db.query(sql1, req.user.id, function (error, result1) {
        if (error) throw error;
        req.flash("success", "Added Successfully!");
        res.render('principal/applications', { data: { applications: result1 }, layout: 'principal/principal_layout' });
      });
    }
  });
});


module.exports = router;
