const express = require('express');
const ReqWrapper = require('../wrapper/req');
const router = module.exports = express.Router();
const ash = require('express-async-handler');
const db = require('../db');

const CANVAS_URL = "https://canvas.instructure.com/";
router.get('/', function(req, res) {
    res.render(__dirname + '/views/index.ejs');
});

router.post('/logout', (req, res) => {
  req.session.destroy((error) => {
    if(error){
      return console.log(error);
    }
  });
});

router.get('/pleaselogin', (req, res) => {
  return res.render(__dirname + '/views/pleaselogin.ejs');
});

router.get('/courses/:id', ash(async(req, res, next) => {
  const sess = req.session;
  const { id } = req.params;
  const rw = new ReqWrapper(req, res, next);

  sess.user_status = await rw.get_my_status();
  if (!sess.canvas) {
    return res.redirect(CANVAS_URL);
  }
  
  let course = null; 
  try {
    course = await rw.get_course_status(id);
  } catch (e) {
    console.log('error', e);
    return res.redirect(CANVAS_URL);
  }

  console.log('sess', JSON.stringify(sess));
  return res.render(__dirname + '/views/course.ejs', {
    P: {
      sess: sess,
      course: course,
      course_id: id
    }
  });
}));

router.get('/dashboard', ash(async(req, res, next) => {
  const sess = req.session;
  
  //if sess null?
  console.log('sess', JSON.stringify(sess));
  if (!sess.canvas) {
    return res.redirect(CANVAS_URL);
  }
  let courses = await db.courses.get_all_async();
  console.log('courses', courses);
  return res.render(__dirname + '/views/dashboard.ejs', {
    P: {
      sess: sess,
      courses: courses,
      course: null,
    }
  });
}));

