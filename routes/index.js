var express = require('express');
var router = express.Router();
const { ensureStudent } = require("../config/auth");
const multer = require('multer');
var db = require("../config/db-config");
const moment = require('moment');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + file.originalname);
  }
});

const upload = multer({ storage: storage });


/* GET home page. */
router.get('/', ensureStudent, function (req, res, next) {
  res.render('student/dashboard', { layout: 'student/student_layout' });
});

router.get('/application/new', ensureStudent, function (req, res, next) {
  var sql = "SELECT id,name FROM application_users WHERE typ='TUTOR' AND stat != true; SELECT * FROM application_types WHERE stat != true;";
  db.query(sql, function (error, result) {
    if (error) throw error;
    res.render('student/new_application', { data: { tutor: result[0], types: result[1] }, layout: 'student/student_layout' });
  });
});

router.get('/application/status', ensureStudent, function (req, res, next) {
  res.render('student/application_status', { layout: 'student/student_layout' });
});

router.post('/application/new', ensureStudent, upload.array('files'), function (req, res, next) {
  // console.log(req.files);
  //  console.log(req.body.type);
  //  return;
  const filepaths = req.files.map(file => file.path); // get an array of file paths
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
      res.render('student/new_application', { data: { tutor: result1[0], types: result1[1] }, layout: 'student/student_layout' });
    });
  });
});

module.exports = router;
