var express = require('express');
var router = express.Router();
const { ensureStudent } = require("../config/auth");
const multer = require('multer');
var db = require("../config/db-config");
const moment = require('moment');
const fs = require('fs');

const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
  // Create the directory if it doesn't exist
  fs.mkdirSync(uploadDir);
}

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
router.get('/', ensureStudent, function (req, res, next) {
  var sql = "SELECT * FROM application_students WHERE user_id=?";
  db.query(sql, req.user.id, function (error, result) {
    if (error) throw error;
    return res.render('student/dashboard', {data: result[0], layout: 'student/student_layout' });
  });
  
});

router.get('/application/new', ensureStudent, function (req, res, next) {
  var sql = "SELECT id,name FROM application_users WHERE typ='TUTOR' AND stat != true; SELECT * FROM application_types WHERE stat != true;";
  db.query(sql, function (error, result) {
    if (error) throw error;
    res.render('student/new_application', { data: { tutor: result[0], types: result[1] }, layout: 'student/student_layout' });
  });
});

router.get('/application/status', ensureStudent, function (req, res, next) {
  var sql = "SELECT c.*,u.name AS tutor,t.type_name FROM application_certificate c,  application_types t, application_users u WHERE c.student_id=? AND c.tutor_id= u.id  AND c.application_type = t.id";
  db.query(sql, req.user.id, function (error, result) {
    if (error) throw error;
    res.render('student/application_status', { data: { applications: result }, layout: 'student/student_layout' });
  });

});

router.post('/application/new', ensureStudent, upload.array('files'), function (req, res, next) {

  const filepaths = req.files.map(file => "/uploads" + file.filename); // get an array of file paths
  const filepathJSON = JSON.stringify(filepaths); // convert the array into a JSON string
  const data = {
    "application_type": req.body.type,
    "description": req.body.description,
    "student_id": req.user.id,
    "tutor_id": req.body.tutor,
    "request_date": moment().format('YYYY-MM-DD HH:mm:ss'),
    "request_files": filepathJSON
  }

  let sql = "INSERT INTO application_certificate SET ?";
  db.query(sql, data, function (error, result) {
    if (error) throw error;
    var sql1 = "SELECT id,name FROM application_users WHERE typ='TUTOR' AND stat != true; SELECT * FROM application_types WHERE stat != true;";
    db.query(sql1, function (error, result1) {
      if (error) throw error;
      return res.render('student/new_application', { data: { tutor: result1[0], types: result1[1] }, layout: 'student/student_layout' });
    });
  });
});

router.get('/application/view', ensureStudent, function (req, res, next) {
  var sql = "SELECT c.*, u1.name AS tutor, u2.name AS HOD, t.type_name FROM application_certificate c JOIN application_users u1 ON c.tutor_id=u1.id JOIN application_users u2 ON c.hod_id=u2.id JOIN application_types t ON c.application_type=t.id WHERE c.id = ?;";
  db.query(sql, req.query.id, function (error, result) {
    if (error) throw error;
    res.render('student/view_application_status', { data: result[0], layout: 'student/student_layout' });
  });
});

module.exports = router;
