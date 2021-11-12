import fetch from 'node-fetch';

const getCarts = require('../../static/carts');
const BASE_URL = 'https://api.playground.klarna.com';

function getKlarnaAuth() {
    const username = process.env.PUBLIC_KEY;
    const password = process.env.SECRET_KEY;
    const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
    return auth;
}

function formatCart(currentCart){
    currentCart.forEach((cartItem)=>{
        cartItem.total_amount = cartItem.quantity * cartItem.unit_price;
        cartItem.total_tax_amount = cartItem.total_amount - cartItem.total_amount * 10000 / (10000 + cartItem.tax_rate);
    });
    return currentCart;
}

// 1. Add async createOrder function that returns Klarna response.json()
async function createOrder(cart_id){

    const currentCart = getCarts()[cart_id];
    const formattedCart = formatCart(currentCart);

    let order_amount = 0;
    let order_tax_amount = 0;
    
    formattedCart.forEach((currentCartItem)=>{
        order_amount += currentCartItem.total_amount;
        order_tax_amount += currentCartItem.total_tax_amount;
    });

    // Sub Parts
    const path = "/checkout/v3/orders";
    const auth = getKlarnaAuth();

    // Main Parts
    const url = BASE_URL + path;
    const method = "POST"; // GET, POST, PUT, DELETE
    const headers = {
        "Content-Type": "application/json",
        "Authorization": auth
    }

    const body = {
        "purchase_country": "SE",
        "purchase_currency": "SEK",
        "locale": "sv-SE",
        "order_amount": order_amount,
        "order_tax_amount": order_tax_amount,
        "order_lines": formattedCart,
        "merchant_urls": {
            "terms": "https://www.example.com/terms.html",
            "checkout": "https://www.example.com/checkout.html",
            "confirmation": `${process.env.CONFIRMATION_URL}/confirmation?order_id={checkout.order.id}`,
            "push": "https://www.example.com/api/push"
        }
    }

    const stringifiedBody = JSON.stringify(body);

    const response = await fetch(url, {
        method,
        headers,
        "body": stringifiedBody
    });

    const jsonResponse = await response.json();
    
    // "200" is success from Klarna KCO docs
    if (response.status === 200 || response.status === 201) {
        return jsonResponse;
    } else {
        console.error("ERROR: ", jsonResponse);
        return {
            html_snippet: `<h1>${JSON.stringify(jsonResponse)}</h1>`
        }
    }
}

// 2. Add async retrieveOrder function that returns Klarna response.json()
async function retrieveOrder(order_id){
    // Sub Parts
    const path = "/checkout/v3/orders/"+order_id;
    const auth = getKlarnaAuth();

    // Main Parts
    const url = BASE_URL + path;
    const method = "GET"; // GET, POST, PUT, DELETE
    const headers = {
        "Authorization": auth
    }

    const response = await fetch(url, {
        method,
        headers,
    });

    // "200" is success from Klarna KCO docs
    if (response.status === 200 || response.status === 201) {
        const jsonResponse = await response.json();
        return jsonResponse;
    } else {
        console.error("ERROR: ", response.status, response.statusText);
        return {
            html_snippet: `<h1>${response.status} ${response.statusText}</h1>`
        }
    }
}

// 3. export createOrder and retrieveOrder below, and use them in api/client/index.js and api/client/confirmation.js
module.exports = {getKlarnaAuth, createOrder, retrieveOrder};