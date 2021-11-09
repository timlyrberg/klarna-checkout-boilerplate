const app = require('../../loaders/express-handlebars');

app.get('/order-lines', function (req, res, next) {
    // THIS ROUTE IS FOR THOSE WHO WANT TO GO ABOVE AND BEYOND IN WEEK 10/11!
    
    // const { cart_ID } = req.query;
    res.send('Use this route to safely get cart information from a database');
});

module.exports = app;
