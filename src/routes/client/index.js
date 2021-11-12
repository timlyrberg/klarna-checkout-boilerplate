const app = require('../../loaders/express-handlebars');

const { createOrder } = require('../../services/server/klarna');

app.get('/checkout/:cart_id', async function (req, res, next) {
	// Replace with HTML snippet from CreateOrder Klarna Request
	const cart_id = req.params.cart_id;

	const klarnaJsonResponse = await createOrder(cart_id);

	const html_snippet = klarnaJsonResponse.html_snippet;

	res.render('checkout', {
		klarna_checkout: html_snippet
	});
});

module.exports = app;
