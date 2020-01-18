const db = require('../db');
const utilmisc = require('../util/misc');

const ReqWrapper = module.exports = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
};

ReqWrapper.prototype.get_user_id = function () {
    return this.req.session.uid;
};
ReqWrapper.prototype.get_role = function (cid) {
    return this.req.session.user.courses[cid];
};
ReqWrapper.prototype.is_teacher = function (cid) {
    return this.get_role(cid) !== "Student"
};
ReqWrapper.prototype.is_student = function (cid) {
    return this.get_role(cid) === "Student"
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

    await Promise.all([
        db.users.puta(u.user_id, u),
        db.courses.puta(c.course_id, c),
    ]);
};