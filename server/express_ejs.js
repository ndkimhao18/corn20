exports.setup = function (app) {
    app.get('/', function(req, res) {
        res.render(__dirname + '/views/index.ejs');
    });
};