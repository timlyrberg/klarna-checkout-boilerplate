const app = require('../../loaders/express-handlebars');
const { createOrder } = require('../../services/server/klarna');

app.get('/', async function (req, res, next) {
	// Replace with HTML snippet from CreateOrder Klarna Request
	const klarnaJsonResponse = await createOrder();

	const html_snippet = klarnaJsonResponse.html_snippet;

	res.render('checkout', {
		klarna_checkout: html_snippet
	});
});

module.exports = app;
