const app = require('../../loaders/express-handlebars');

app.get('/', function (req, res, next) {
	res.send('Go here when payment should be initiated');
});

module.exports = app;
