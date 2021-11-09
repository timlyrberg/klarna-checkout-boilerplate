import config from '../../config';
import KlarnaAPIService from './KlarnaAPIService';
import BusinessLogic from './BusinessLogic.js';
import { json } from 'express';

class KlarnaUIService {

	static throwError(reject, err) {
		console.error(err);
		reject(err);
	}

	static getKlarnaCheckoutSnippet(productID, callback = () => { }) {
		return new Promise((resolve, reject) => {
			const orderPromise = KlarnaAPIService.createOrderPromise(productID);
			orderPromise
				.then((response) => {
					resolve(response.html_snippet);
					callback();
				})
				.catch((err) => { this.throwError(reject, err); });
		});
	}
	static getKlarnaPaymentSnippet(productID, callback = () => { }) {
		return new Promise((resolve, reject) => {
			const orderPromise = KlarnaAPIService.createAuthTokenPromise(productID);
			orderPromise
				.then((response) => {
					resolve(response.html_snippet);
					callback();
				})
				.catch((err) => { this.throwError(reject, err); });
		});
	}

	static getKlarnaConfirmationSnippet(order_id, callback = () => { }) {
		return new Promise((resolve, reject) => {
			const readOrderPromise = KlarnaAPIService.readOrder(order_id);
			readOrderPromise
				.then(({ klarna_response, klarna_confirmation_snippet }) => {
					resolve({
						klarna_response,
						klarna_confirmation_snippet
					});
					callback(klarna_response);
				})
				.catch((err) => { this.throwError(reject, err); });
		});
	}

	static renderKlarnaCheckout(appRes, productID, user_ID, callback = () => { }) {
		this.getKlarnaCheckoutSnippet(productID, callback)
			.then((html_snippet) => {
				appRes.render('checkout', {
					title: `Betala med Klarna - ${config.mmr.customer.name}`,
					klarna_checkout: html_snippet
				});
			})
			.catch(console.error);
	}

	static renderKlarnaPayment(appRes, product_ID, product_price, email) {

		KlarnaAPIService.getKlarnaSessionToken(product_ID, (client_token, identifier) => {
			appRes.render('payment', {
				title: `Betala med Klarna - ${config.mmr.customer.name}`,
				identifier: identifier,
				client_token: client_token,
				email,
				product_ID,
				product_price
			});
		});
	}

	static renderKlarnaPaymentConfirmation(appRes, order_id, callback = () => { }) {
		this.getKlarnaConfirmationSnippet(order_id, callback)
			.then(({ klarna_response, klarna_confirmation_snippet }) => {
				const billing_address = klarna_response.billing_address;
				const email = billing_address.email;
				const name = `${billing_address.given_name} ${billing_address.family_name}`;
				const password = Math.random().toString(36).slice(-8); // randomize pass
				appRes.render('checkout', {
					title: `Order bekräftad! - ${config.mmr.customer.name}`,
					klarna_confirmation: klarna_confirmation_snippet,
					email: email,
					password: password
				});
			})
			.catch(console.error);
	}
}

export default KlarnaUIService;
