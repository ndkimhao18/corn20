exports.genId = function () {
    // const hrTime = process.hrtime();
    // return Math.floor(hrTime[0] * 1000000 + hrTime[1] / 1000) - 60000000000;
    return Date.now() - 1574553000000;
};

exports.clone = function (o) {
    return JSON.parse(JSON.stringify(o));
};

exports.now = function () {
    return Date.now();
};

exports.removeItemFromArray = function (array, item) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === item) {
            array.splice(i, 1);
            break;
        }
    }
};

exports.routeUnless = function (prefix, middleware) {
    return function (req, res, next) {
        if (req.path.startsWith(prefix)) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    };
};

exports.streamToObject = function (s) {
    return new Promise(function (resolve, reject) {
        const ret = {};
        s
            .on('data', function (data) {
                // console.log(data);
                ret[data.key] = data.value;
            })
            .on('error', function (err) {
                // console.log(err);
                reject(err);
            })
            .on('close', function () {
            })
            .on('end', function () {
                // console.log("RET", ret, '\n');
                resolve(ret);
            });
    });
};