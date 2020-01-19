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

// =====================================================================================================================

const io = require('../express_io');
ReqWrapper.prototype.get_course_status = async function (cid) {
    const ret = {
        online: io.get_online_user_in_queue(cid),
        tickets: await utilmisc.streamToObject(db.tickets.createReadStream({start: cid + ':', end: cid + ':~'})),
        users_info: {},
        course_info: await db.courses.geta(cid),
    };
    //console.log(ret)
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
        waits.push(f(value.user_id));
        if (value.assignee)
            waits.push(f(value.assignee));
    }
    await Promise.all(waits);
    return ret;
};

ReqWrapper.prototype.new_ticket = async function (cid, notes) { // uid = student id
    const uid = this.get_user_id();
    const tid = cid + ':' + uid;
    await db.users.geta(uid);
    await db.tickets.puta(tid, {
        course_id: cid,
        user_id: uid,
        status: 'Waiting',
        notes,
        assignee: null,
        created_at: utilmisc.now()
    });
    await Promise.all([this.emit_new_course_status(cid), this.emit_new_user_status(uid)]);
};

ReqWrapper.prototype.upd_ticket_helping = async function (tid) {
    const ticket = await db.tickets.geta(tid);
    ticket.status = 'Helping';
    ticket.assignee = this.get_user_id();
    await db.tickets.puta(tid, ticket);
    await Promise.all([
        this.emit_new_course_status(tid),
        this.emit_new_user_status(this.get_user_id()),
        this.emit_new_user_status(tid)]);
};

ReqWrapper.prototype.upd_ticket_resolved = async function (tid) {
    const {assignee} = await db.tickets.geta(tid);
    await db.tickets.dela(tid);
    await Promise.all([
        this.emit_new_course_status(tid),
        this.emit_new_user_status(tid),
        this.emit_new_user_status(assignee)]);
};

ReqWrapper.prototype.emit_new_course_status = async function (ctid) {
    const cid = ('' + ctid).split(':')[0];
    const stat = await this.get_course_status(cid);
    io.emit_course(cid, 'new_course_status', stat);
};
ReqWrapper.prototype.emit_new_user_status = async function (cuid) {
    const p = ('' + cuid).split(':');
    const uid = p[p.length - 1];
    // log('emit u ', uid, await this.get_user_status(uid))
    io.emit_user(uid, 'new_user_status', await this.get_user_status(uid));
};

ReqWrapper.prototype.get_my_status = async function () {
    return this.get_user_status(this.get_user_id());
};
ReqWrapper.prototype.get_user_status = async function (uid) {
    return {
        info: await this.get_user_async(),
        is_teacher: this.is_teacher(),
        ticket: await (this.is_teacher() ? db.tickets.by_assignee : db.tickets.by_user_id).getan(uid),
    };
};

// =====================================================================================================================

ReqWrapper.prototype.get_all_chat = async function (cid) {
    const obj = await utilmisc.streamToObject(db.chats.createReadStream({start: cid + ':', end: cid + ':~'}));
    const arr = Object.values(obj);
    arr.sort((x, y) => {
        if (x.pinned !== y.pinned) {
            return y.pinned - x.pinned;
        }
        return x.msg_id - y.msg_id
    });
    return arr;
};

ReqWrapper.prototype.add_chat_msg = async function (cid, msg) {
    const mid = cid + ':' + utilmisc.genId();
    const m = {
        course_id: cid,
        msg_id: mid,
        user_id: this.get_user_id(),
        full_name: this.req.session.user.full_name,
        first_name: this.req.session.user.first_name,
        last_name: this.req.session.user.last_name,
        image: this.req.session.user.image,
        pinned: false,
        created_at: utilmisc.now(),
        msg
    };
    await db.chats.puta(mid, m);
    io.emit_course(cid, 'chat_msg', m);
};

ReqWrapper.prototype.upd_chat_msg_pinned = async function (mid, pinned) {
    const m = await db.chats.geta(mid);
    m.pinned = pinned;
    await db.chats.puta(mid, m);
    io.emit_course(mid.split(':')[0], 'chat_msg_upd_pinned', m);
};