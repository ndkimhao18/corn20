const express = require('express');
const ash = require('express-async-handler');
const router = module.exports = express.Router();
const log = require('../util/req-log')('ta:api:canvas');
const {Validator} = require('node-input-validator');

const db = require('../db');
const utilmisc = require('../util/misc');

const ReqWrapper = require('../wrapper/req');

router.post('/entry', ash(async (req, res, next) => {
    const rw = new ReqWrapper(req, res, next);
    const canvas = req.session.canvas = req.body;
    log(req, 'Canvas info', canvas);
    const uid = req.session.uid = parseInt(canvas.custom_canvas_user_id);
    const role = req.session.role = canvas.roles;

    let u = await rw.get_user_async_null();
    if (u === null) {
        req.session.user = u = {
            user_id: uid,
            full_name: canvas.lis_person_name_full,
            first_name: canvas.lis_person_name_given,
            last_name: canvas.lis_person_name_family,
            role,
            courses: {}
        };
        log(req, "Creating new user: ", u);
        await db.users.puta(uid, u);
    }

    const cid = canvas.custom_canvas_course_id;
    let c = await db.courses.getan(cid);
    if (c === null) {
        c = {
            course_id: cid,
            code: canvas.context_label,
            title: canvas.context_title,
            members: {}
        };
        log(req, "Creating new course: ", c);
        await db.courses.puta(cid, c);
    }

    await rw.add_course_async(cid, role);

    res.redirect('/dashboard');
    //res.json("ok");
}));