import config from '../../config';
import { subscriptions } from '../../static/enums/subscriptions';
import APIService from './APIService';
import BusinessLogic from './BusinessLogic';
import RESTService from './RESTService';
import SubscriptionService from './SubscriptionService';
import Subscription from '../../static/Subscription.js';

class ThinkificService extends APIService {
	static getRequestOptions() {
		const headers = {
			'Content-Type': 'application/json',
			'X-Auth-API-Key': config.thinkific.apiKey,
			'X-Auth-Subdomain': config.thinkific.subDomain
		};
		return super.getRequestOptions('thinkific', headers);
	}

	static getExternalOrderDetails({ product_id, user_id, klarna_order_id }) {
		const product_details = BusinessLogic.getProducts(product_id)[0].toObject();
		const thinkific_details = product_details.meta_data.thinkific;
		return {
			payment_provider: 'Klarna',
			user_id: user_id,
			product_id: thinkific_details.product_id,
			order_type: thinkific_details.order_type,
			transaction: {
				amount: product_details.unit_price,
				currency: 'SEK',
				reference: klarna_order_id,
				action: 'purchase'
			}
		};
	}

	static getEnrollDetails(user_id, subscription) {
		return JSON.stringify({
			user_id: user_id,
			activated_at: new Date(subscription.current_period_start).toISOString(),
			expiry_date: new Date(
				subscription.current_period_end + subscriptions.billing_settings.overdue_ms
			).toISOString()
		});
	}

	static createUserDetails({ user_details, bundle_id, subscription_billing_interval, customer_token, reference_code }) {
		const user_id = user_details.user_id;
		const affiliate_code = this.toCustomProfileField(
			{ value: reference_code },
			'affiliate_code'
		);

		// OBS: This is just a subscription object, and does not trigger the actual subscription.
		const subscription = this.toCustomProfileField(
			new Subscription(user_id, subscription_billing_interval, customer_token).toObject(),
			'subscription'
		);

		const custom_profile_fields = [affiliate_code, subscription];

		return {
			first_name: user_details.given_name,
			last_name: user_details.family_name,
			email: user_details.email,
			send_welcome_email: true,
			custom_profile_fields
		};
	}

	static getUserById(id) {
		const USER_PER_FETCH_LIMIT = id ? 1 : 10000000;
		const request_options = this.getRequestOptions();
		const request_body = id ? { id } : { };
		request_options.path = id ? `${config.thinkific.standardPath}/users/${id}` : `${config.thinkific.standardPath}/users?limit=${USER_PER_FETCH_LIMIT}`;
		request_options.method = 'GET';
		request_options.body = JSON.stringify(request_body);

		return new Promise((resolve, reject) => {
			RESTService.getJSON(request_options, (resCode, obj) => {
				resCode === 200 ? resolve(obj) : reject(obj);
			});
		});
	}

	static getAllUsers() {
		return this.getUserById(); // no id param === fetches all users
	}

	static updateUserPromise(user_id, update_doc) {
		const request_options = this.getRequestOptions();
		const request_body = JSON.stringify(update_doc);
		request_options.path = `${config.thinkific.standardPath}/users/${user_id}`;
		request_options.method = 'PUT';
		request_options.body = request_body;

		return new Promise((resolve, reject) => {
			RESTService.getJSON(request_options, (resCode, response) => {
				resCode === 200 || resCode === 204 ? resolve(response) : reject(response);
			});
		});
	}

	static updateUser(user_id, update_doc, callback) {
		// Update endpoint
		this.updateUserPromise(user_id, update_doc)
			.then((response) => {
				callback(response);
			})
			.catch((err) => {
				console.error('ErrorA:', err);
			});
	}

	static getAllSubscriptions() {
		const users = this.getAllUsers();
		// Map to subData + user_id according to Subscription model
	}

	static readReferenceCode(req) {
		//check query param first then fall back to cookie'
		const { ref } = req.query;
		const val = ref ? ref : req.cookies.affiliatecode;
		return val;
	}

	static createUserPromise({ user_details, bundle_id, subscription_billing_interval, customer_token, reference_code }) {
		const request_options = this.getRequestOptions();
		const request_body = JSON.stringify(
			this.createUserDetails({ user_details, bundle_id, subscription_billing_interval, customer_token, reference_code })
		);
		request_options.path = `${config.thinkific.standardPath}/users`;
		request_options.method = 'POST';
		request_options.body = request_body;

		return new Promise((resolve, reject) => {
			RESTService.getJSON(request_options, (resCode, response) => {
				resCode === 201 || resCode === 204 ? resolve(response) : reject(response);
			});
		});
	}

	static createUser({ user_details, bundle_id, subscription_billing_interval, customer_token, reference_code }, callback) {
		this.createUserPromise({ user_details, bundle_id, subscription_billing_interval, customer_token, reference_code })
			.then((response) => {
				// console.log("createUserResp", response);
				callback(response);
			})
			.catch((err) => {
				console.error('ErrorB:', err);
			});
	}

	static createExternalOrderPromise({ product_id, user_details, klarna_order_id }) {
		const request_options = this.getRequestOptions();
		const request_body = JSON.stringify(
			this.getExternalOrderDetails({ product_id, user_id: user_details.user_id, klarna_order_id })
		);
		request_options.path = `${config.thinkific.standardPath}/external_orders`;
		request_options.method = 'POST';
		request_options.body = request_body;

		return new Promise((resolve, reject) => {
			RESTService.getJSON(request_options, (resCode, response) => {
				resCode === 201 || resCode === 204 ? resolve(response) : reject(response);
			});
		});
	}

	static createExternalOrder({ product_id, user_details, klarna_order_id }, callback) {
		this.createExternalOrderPromise({ product_id, user_details, klarna_order_id })
			.then((response) => {
				callback(response);
			})
			.catch((err) => {
				console.error('ErrorC:', err);
			});
	}

	static enrollToBundlePromise({ user_id, bundle_id, subscription }) {
		const request_options = this.getRequestOptions();
		const request_body = this.getEnrollDetails(user_id, subscription);
		request_options.path = `${config.thinkific.standardPath}/bundles/${bundle_id}/enrollments`;
		request_options.method = 'POST';
		request_options.body = request_body;

		return new Promise((resolve, reject) => {
			RESTService.getJSON(request_options, (resCode, response) => {
				resCode === 201 || resCode === 202 ? resolve(response) : reject(response);
			});
		});
	}

	static enrollToBundle({ user_id, bundle_id, subscription }, callback) {
		this.enrollToBundlePromise({ user_id, bundle_id, subscription })
			.then((response) => {
				callback(response);
			})
			.catch((err) => {
				console.error('Error Bundle Enrollment:', err);
			});
	}

	// TODO: Write update PUT enrollment that 
	// 1. updates on subscription recurring charge to next billing period...
	static updateBundlePromise(user_id, bundle_id, update_doc) {
		const request_options = this.getRequestOptions();
		const modified_update_doc = update_doc;
		modified_update_doc.user_id = user_id;
		const request_body = JSON.stringify(modified_update_doc);
		request_options.path = `${config.thinkific.standardPath}/bundles/${bundle_id}/enrollments`;
		request_options.method = 'PUT';
		request_options.body = request_body;

		return new Promise((resolve, reject) => {
			RESTService.getJSON(request_options, (resCode, response) => {
				resCode === 204 ? resolve(response) : reject(response);
			});
		});
	}

	static updateBundle(user_id, bundle_id, update_doc, callback) {
		// Update endpoint
		this.updateUserPromise(user_id, bundle_id, update_doc)
			.then((response) => {
				callback(response);
			})
			.catch((err) => {
				console.error('ErrorA:', err);
			});
	}

	/**
	 * Converts json to Thinkifics custom_profile_fields format
	 * @param {Object} json
	 */
	static toCustomProfileField(json, label) {
		let index;
		if  (label === 'affiliate_code') {
			index = 35630;
		} else if (label === 'subscription') {
			index = 35631;
		} else {
			console.error('toCustomProfileField(): invalid LABEL', label)
		}
		// TODO, use label to get index...
		const custom_profile_field = {
			value: JSON.stringify(json),
			custom_profile_field_definition_id: index
		};

		return custom_profile_field;
	}

	/**
	 * Converts Thinkifics custom_profile_fields format to json
	 * @param {Object} custom_profile_fields
	 */
	static toJson(custom_profile_fields, label) {
		const field = custom_profile_fields.filter((object) => object.label === label)[0];
		let json;
		if (field.value) {
			try {
				json = JSON.parse(field.value);
			} catch(error) {
				console.error('Couldn\'t parse customer_profile field', {label, field_value: field.value});
				json = JSON.parse(null);
			}
		}

		return json;
	}
}

export default ThinkificService;
