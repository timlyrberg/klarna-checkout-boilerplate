import fetch from 'node-fetch';

async function getItemById(id) {
	const response = await fetch(`https://fakestoreapi.com/products/${id}`);
	if (response.ok) {
		const product = await response.json();
		return product;
	} else {
		console.error('ERROR: ', response);
		throw new Error('500 error! Fake store API not available');
	}
}

async function getCartById(id) {
	const response = await fetch(`https://fakestoreapi.com/carts/${id}`);
	if (response.ok) {
		const cart = await response.json();
		return cart;
	} else {
		console.error('ERROR: ', response);
		throw new Error('500 error! Fake store API not available');
	}
}

async function getProductsFromCart(cart) {
	const { products } = cart;
	const response = await fetch('https://fakestoreapi.com/products');
	if (response.ok) {
		const productsFromDB = await response.json();
		const productsFromCart = [];
		products.forEach((product) => {
			const foundProduct = productsFromDB.find((productFromDB) => productFromDB.id === product.productId);
			if (!!foundProduct) {
				productsFromCart.push({ product: foundProduct, quantity: product.quantity });
			}
		});
		return productsFromCart;
	} else {
		console.error('ERROR: ', response);
		throw new Error('500 error! Fake store API not available');
	}
}

module.exports = { getItemById, getCartById, getProductsFromCart };
