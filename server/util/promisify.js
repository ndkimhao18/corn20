const {promisify} = require('util');

function listProps(ret, obj) {
    if (obj == null) return;
    Object.getOwnPropertyNames(obj).forEach(k => ret.push(k));
    listProps(ret, Object.getPrototypeOf(obj));
}

module.exports.all = (obj) => {
    if (obj.async)
        process.exit(1);

    let keys = [];
    listProps(keys, obj);
    //console.log(keys);

    obj.async = {};
    for (let key of keys) {
        const value = obj[key];
        if (typeof value !== 'function') continue;
        //console.log(key);
        obj.async[key] = obj[key + 'a'] = obj[key + 'Async'] = promisify(value).bind(obj);
    }
    return obj;
};