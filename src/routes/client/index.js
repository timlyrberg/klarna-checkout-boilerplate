const app = require('../../loaders/express-handlebars');

const { createOrder } = require('../../services/server/klarna');

app.get('/', async function (req, res, next) {
	console.log(await createOrder());
	const { html_snippet } = await createOrder();

	res.render('checkout', {
		klarna_checkout: html_snippet
	});
});

module.exports = app;
