const express = require('express');
const router = module.exports = express.Router();

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

router.get('/courses/:id', (req, res) => {
  const sess = req.session;
  console.log('sess', sess);
  return res.render(__dirname + '/views/course.ejs');
});

router.get('/dashboard', (req, res) => {
    return res.render(__dirname + '/views/dashboard.ejs');
});

