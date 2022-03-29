const app = require('../../loaders/express-handlebars');
const { createOrder } = require('../../services/server/klarna');
const { getCartById, getProductsFromCart } = require('../../services/server/fakeStore');

app.get('/:id', async function (req, res, next) {
	try {
		const id = req.params.id;
		const cart = await getCartById(id);
		const products = await getProductsFromCart(cart);
		const klarnaJsonResponse = await createOrder(products);
		const html_snippet = klarnaJsonResponse.html_snippet;
		res.render('checkout', { klarna_checkout: html_snippet });
	} catch (error) {
		res.send(error.message);
	}
});

module.exports = app;
