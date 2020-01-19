const express = require('express');
const ash = require('express-async-handler');
const router = module.exports = express.Router();
const log = require('../util/req-log')('ta:ctrl:user');
const {Validator} = require('node-input-validator');

const db = require('../db');
const utilmisc = require('../util/misc');

const ReqWrapper = require('../wrapper/req');

router.get('/1', ash(async (req, res, next) => {
    const rw = new ReqWrapper(req, res, next);
    res.set({'Content-Type': 'application/json; charset=utf-8'}).send(200, JSON.stringify(await rw.get_course_status(1810097), undefined, '  '));
    //res.json(await rw.get_course_status(1810097));
}));

router.get('/T-get-help', ash(async (req, res, next) => {
    const rw = new ReqWrapper(req, res, next);

    const { course_id, note } = req.query;
    await rw.new_ticket(course_id, {this_is_the_note: note});
    res.json("ok");
}));

router.get('/T-help-student', ash(async (req, res, next) => {
    const rw = new ReqWrapper(req, res, next);
    const { courseid_learnerid } = req.query;
    await rw.upd_ticket_helping(courseid_learnerid);
    res.json("ok");
}));

router.get('/TS-done', ash(async (req, res, next) => {
    const rw = new ReqWrapper(req, res, next);
    const { courseid_learnerid } = req.query;
    await rw.upd_ticket_resolved(courseid_learnerid);
    res.json("ok");
}));

router.get('/me', ash(async (req, res, next) => {
    const rw = new ReqWrapper(req, res, next);
    res.json(await rw.get_my_status());
}));

router.get('/pin/:pinned', ash(async (req, res, next) => {
    const rw = new ReqWrapper(req, res, next);
    rw.upd_chat_msg_pinned("1810097:4850088078", req.params.pinned === '1');
    res.json("ok");
}));

router.get('/get', ash(async (req, res, next) => {
    res.json({
        // a: await db.users.geta("123"),
        // a1: await db.users.geta("1234"),
        // //b: await db.users.geta("1233"),
        // //c: await db.users.byEmail.geta("123"),
        // d: await db.users.byEmail.geta("456"),
        // e: await db.users.byEmail.geta("4567"),
        // g: await db.users.byTag.get_all_async('1'),
        // h: await db.users.byTag.get_all_async('2')
        e: await db.courses.get_all_async(),
    });
}));
router.get('/test', ash(async (req, res, next) => {
    const user = {
        username: "123",
        email: "456",
        tag: "1"
    };
    await db.users.putAsync("123", user);
    await db.users.putAsync("1234", {
        username: "1234",
        email: "4567",
        tag: "1"
    });
    await db.users.putAsync("a", {
        username: "a",
        email: "b",
        tag: "2"
    });

    res.json("OK");

    // clearAuth(req);
    // const valid = await new Validator(req.body, {
    //     name: 'required|ascii|maxLength:128|minLength:1',
    //     email: 'email',
    // }).check();
    // if (!valid) {
    //     return res.json({code: 404, msg: 'Invalid data', reqid: req.reqid});
    // }
    //
    // let user = await db.student.get(req.body.name);
    // log(req, 'Got from db[%o], %o', req.body.name, user);
    // if (!user) {
    //     user = {
    //         username: req.body.name,
    //         email: req.body.email
    //     };
    //     modelStudent.putStudent(user);
    //     req.session.student = utilmisc.clone(user);
    //     return res.json({code: 0, msg: 'Ok', newStudent: true, student: user, reqid: req.reqid});
    // } else {
    //     req.session.student = utilmisc.clone(user);
    //     return res.json({code: 0, msg: 'Ok', newStudent: false, student: user, reqid: req.reqid});
    // }
}));

router.get('/all', ash(async (req, res, next) => {
    res.set({'Content-Type': 'application/json; charset=utf-8'}).send(200, JSON.stringify(await utilmisc.streamToObject(db._db.createReadStream()), undefined, '  '));

}));