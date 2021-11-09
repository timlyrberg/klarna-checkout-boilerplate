const app = require('../../loaders/express-handlebars');

const { createOrder } = require('../../services/server/klarna');

app.get('/', async function (req, res, next) {
	 // Replace with HTML snippet from CreateOrder Klarna Request
	const html_snippet = `<h1>Please make an order request in api/client/index.html</h1>`;

	res.render('checkout', {
		klarna_checkout: html_snippet
	});
});

module.exports = app;
