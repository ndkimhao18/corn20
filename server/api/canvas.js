const express = require('express');
const ash = require('express-async-handler');
const router = module.exports = express.Router();
const log = require('../util/req-log')('ta:ctrl:user');
const {Validator} = require('node-input-validator');

const db = require('../db');
const utilmisc = require('../util/misc');

const ReqWrapper = require('../wrapper/req')

router.post('/entry', ash(async (req, res, next) => {
    const canvas = req.session.canvas = req.body;
    const rw = new ReqWrapper(req, res, next);

    const u = await rw.get_user_async_null();
    if (u === null) {
        const uid = req.session.uid = rw.get_user_id();
        req.session.role = canvas.roles;
        await db.users.put(uid, {
            user_id: uid,
            full_name: canvas.lis_person_name_full,
            first_name: canvas.lis_person_name_given,
            last_name: canvas.lis_person_name_family,
            courses: []
        });
    }

    const cid = canvas.custom_canvas_course_id;
    const c = await db.courses.get(cid);
    if (c === null) {
        await db.courses.put(cid, {
            course_id: cid,
            code: canvas.context_label,
            title: canvas.context_title,
            members: []
        });
    }

    await req.add_course_async(cid);

    res.redirect('/');
}));