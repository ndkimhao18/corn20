const db = require('../db');
const utilmisc = require('../util/misc');
const log = require('debug')('ta:req-wrap');

const ReqWrapper = module.exports = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
};

ReqWrapper.prototype.get_user_id = function () {
    return this.req.session.uid;
};
ReqWrapper.prototype.get_role = function (cid) {
    return this.req.session.role;
};
ReqWrapper.prototype.is_teacher = function (cid) {
    return this.get_role(cid) !== "Learner"
};
ReqWrapper.prototype.is_student = function (cid) {
    return this.get_role(cid) === "Learner"
};

ReqWrapper.prototype.get_user_async_null = async function () {
    return await db.users.getan(this.get_user_id());
};
ReqWrapper.prototype.get_user_async = async function () {
    return await db.users.geta(this.get_user_id());
};

ReqWrapper.prototype.add_course_async = async function (cid, role) {
    const u = await this.get_user_async();
    const c = await db.courses.geta(cid);

    u.courses[cid] = role;
    c.members[this.get_user_id()] = role;

    this.req.session.user = u;
    await Promise.all([
        db.users.puta(u.user_id, u),
        db.courses.puta(c.course_id, c),
    ]);
};

const io = require('../express_io');
ReqWrapper.prototype.get_course_status = async function (cid) {
    const ret = {
        online: io.get_online_user_in_queue(cid),
        tickets: await utilmisc.streamToObject(db.tickets.createReadStream({start: cid + ':', end: cid + ':~'})),
        users_info: {},
        course_info: await db.courses.geta(cid),
    };
    const f = async (uid) => {
        //log(uid)
        uid = parseInt(uid);
        if (!ret.users_info[uid]) {
            ret.users_info[uid] = await db.users.geta(uid);
            //log(ret.users_info[uid]);
        }
    };
    const waits = [];
    for (let uid of ret.online) {
        //log("ite", uid)
        waits.push(f(uid));
    }
    for (let [key, value] of Object.entries(ret.tickets)) {
        const p = key.split(':');
        value.course_id = p[0];
        value.user_id = p[1];
        waits.push(f(value.user_id));
        if (value.assignee)
            waits.push(f(value.assignee));
    }
    await Promise.all(waits);
    return ret;
};

ReqWrapper.prototype.new_ticket = async function (cid, uid, notes) { // uid = student id
    const tid = cid + ':' + uid;
    await db.users.geta(uid);
    await db.tickets.puta(tid, {
        // course_id: cid,
        // user_id: uid,
        status: 'Waiting',
        notes,
    });
    await this.emit_new_course_status(cid);
};

ReqWrapper.prototype.upd_ticket_helping = async function (tid, uid) { // uid = teacher id
    const ticket = await db.tickets.geta(tid);
    ticket.status = 'Helping';
    ticket.assignee = this.get_user_id();
    await db.users.geta(uid);
    await db.tickets.puta(tid, ticket);
    await this.emit_new_course_status(tid);
};

ReqWrapper.prototype.upd_ticket_resolved = async function (tid) {
    await db.tickets.dela(tid);
    await this.emit_new_course_status(tid);
};

ReqWrapper.prototype.emit_new_course_status = async function (ctid) {
    const cid = ('' + ctid).split(':')[0];
    const stat = await this.get_course_status(cid);
    io.emit_course(cid, 'new_course_status', stat);
};