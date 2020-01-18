const express = require('express');
const ash = require('express-async-handler');
const router = module.exports = express.Router();
const log = require('../util/req-log')('ta:ctrl:user');
const {Validator} = require('node-input-validator');

const db = require('../db');
const utilmisc = require('../util/misc');

const path = require('path');

router.post('/entry', ash(async (req, res, next) => {
    req.session._canvas = req.body;
    res.redirect('/');
}));