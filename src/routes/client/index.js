const app = require('../../loaders/express-handlebars');

const { createOrder } = require('../../services/server/klarna');

app.get('/', async function (req, res, next) {
	// Replace with HTML snippet from CreateOrder Klarna Request
	const html_snippet = `<h1>Now we can start to make some API calls</h1>`;

	res.render('checkout', {
		klarna_checkout: html_snippet
	});
});

module.exports = app;
