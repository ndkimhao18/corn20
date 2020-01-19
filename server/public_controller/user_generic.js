const express = require('express');
const ReqWrapper = require('../wrapper/req');
const router = module.exports = express.Router();
const ash = require('express-async-handler');

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
  
  console.log('req.params', req.params, 'id', id);
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

  console.log('course', course);
  return res.render(__dirname + '/views/course.ejs', {
    sess: sess,
    course: course,
  });
}));

router.get('/dashboard', (req, res) => {
  const sess = req.session;
  //if sess null?
  
  if (!sess.canvas) {
    return res.redirect(CANVAS_URL);
  }

  return res.render(__dirname + '/views/dashboard.ejs', {
    sess: sess
  });
});

