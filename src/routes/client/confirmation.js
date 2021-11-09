const app = require('../../loaders/express-handlebars');

app.get('/confirmation', function (req, res, next) {
    res.send('Go here when payment is complete and receipt should be shown');
});

module.exports = app;