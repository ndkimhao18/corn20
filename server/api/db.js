const express = require('express');
const ash = require('express-async-handler');
const router = module.exports = express.Router();
const log = require('../util/req-log')('ta:ctrl:user');
const {Validator} = require('node-input-validator');

const db = require('../db');
const utilmisc = require('../util/misc');

router.get('/all', ash(async (req, res, next) => {
    let d = db._db;
    if (req.query.db) d = db[req.query.db];
    dat = await d.get_all_async();
    res.set({'Content-Type': 'application/json; charset=utf-8'}).send(200, JSON.stringify(dat, undefined, '  '));
}));