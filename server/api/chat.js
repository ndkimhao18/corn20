const express = require('express');
const ash = require('express-async-handler');
const router = module.exports = express.Router();
const log = require('../util/req-log')('ta:ctrl:user');
const {Validator} = require('node-input-validator');

const db = require('../db');
const utilmisc = require('../util/misc');

const ReqWrapper = require('../wrapper/req');

router.get('/:cid', ash(async (req, res, next) => {
    const rw = new ReqWrapper(req, res, next);

    res.json();
}));