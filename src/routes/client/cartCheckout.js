const app = require('../../loaders/express-handlebars');
const { createOrder } = require('../../services/server/klarna')
const { getCartById, getProductsFromCart } = require('../../services/server/fakeStore')

app.get('/:cart_id', async function (req, res) {
    try {
        const { cart_id } = req.params;
        const cart = await getCartById(cart_id);
        const products = await getProductsFromCart(cart);
        console.log(products);
        res.send('testing');


        /*
        const klarnaJsonResponse = await createOrder();
        const html_snippet = klarnaJsonResponse.html_snippet;
        res.render('checkout', { klarna_checkout: html_snippet });
        */
    } catch(error) {
        console.error(error);
        req.send(error.message)
    }
});

module.exports = app;
