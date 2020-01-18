exports.setup = function (app) {
    app.use('/api/user', require('./api/user'));
};