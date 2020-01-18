exports.setup = function (app) {
    app.use('/', require('./public_controller/user_generic'));
};