const express = require('express');
const router = module.exports = express.Router();


router.get('/dashboard', (req, res) => {
  return res.render(__dirname + '/views/dashboard.ejs');
});

