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

module.exports = { getItemById };
