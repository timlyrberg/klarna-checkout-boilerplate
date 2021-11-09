import config from '../../config';
import RESTService from './RESTService';
import BusinessLogic from './BusinessLogic.js';
import TapfiliateService from './Tapfiliate.service';
import ThinkificService from './ThinkificService';
import { AssignedAddOnContext } from 'twilio/lib/rest/api/v2010/account/incomingPhoneNumber/assignedAddOn';
import { PRODUCTS } from '../../static/Products';

class KlarnaAPIService {
    static getKlarnaAuth() {
        const username = config.klarna.publicKey;
        const password = config.klarna.secretKey;
        const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
        return auth;
    }

    static throwError(reject, err) {
        console.error(err);
        reject(err);
    }

    static getKlarnaAuth() {
        const username = config.klarna.publicKey;
        const password = config.klarna.secretKey;
        const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
        return auth;
    }

    static getKlarnaRequestOptions() {
        return {
            host: config.klarna.baseUrl,
            port: 443, // default 443 for HTTP
            path: '', // e.g. '/checkout/v3/orders', usually set in a method
            method: '', // 'GET', 'POST', usually set in a method
            body: '', // {} JSON raw mostly, usually set in a method
            headers: {
                'Content-Type': 'application/json', // default is JSON
                'Authorization': this.getKlarnaAuth()
            },
        };
    }

    static getOrderBody(productId) {
        const products = BusinessLogic.getProducts(productId);
        const { order_amount, order_tax_amount, order_lines } = BusinessLogic.getProductData(products);
        return JSON.stringify({
            "purchase_country": config.klarna.purchase_country,
            "purchase_currency": config.klarna.purchase_currency,
            "locale": config.klarna.locale,
            order_amount,
            order_tax_amount,
            order_lines,
            "merchant_urls": {
                "terms": `${config.klarna.merchantTermsUrl}`,
                "checkout": `${config.klarna.merchantCheckoutUrl}?order_id={checkout.order.id}"`,
                "confirmation": `${config.root_url}/confirmation?order_id={checkout.order.id}`,
                "push": `${config.root_url}/push?order_id={checkout.order.id}"`
            }
        });
    }

    static createOrderPromise(productId) {
        const orderBody = this.getOrderBody(productId);
        const requestOptions = this.getKlarnaRequestOptions();
        requestOptions.path = '/checkout/v3/orders';
        requestOptions.method = 'POST';
        requestOptions.body = orderBody;

        return new Promise((resolve, reject) => {
            RESTService.getJSON(requestOptions, (resCode, obj) => {
                resCode === 201 ? resolve(obj) : reject(obj);
            });
        });
    }

    static readOrder(order_id) {
        const requestOptions = this.getKlarnaRequestOptions();
        requestOptions.path = `/checkout/v3/orders/${order_id}`;
        requestOptions.method = 'GET';
        return new Promise((resolve, reject) => {
            RESTService.getJSON(requestOptions, (resCode, klarna_response) => {
                if (resCode === 200) {
                    const klarna_confirmation_snippet = klarna_response.html_snippet;
                    resolve({
                        klarna_response,
                        klarna_confirmation_snippet
                    });
                } else {
                    reject(obj);
                }
            });
        });
    }

    static acknowledgeOrder(order_id) {
        const requestOptions = this.getKlarnaRequestOptions();
        requestOptions.path = `/ordermanagement/v1/orders/${order_id}/acknowledge`;
        requestOptions.method = 'POST';
        requestOptions.body = JSON.stringify({ order_id });
        return new Promise((resolve, reject) => {
            RESTService.getJSON(requestOptions, (resCode, obj) => {
                resCode === 204 ? resolve(obj) : reject(obj);
            });
        });
    }

    static captureOrder(order_id, productId) {
        const products = BusinessLogic.getProducts(productId);
        const orderData = BusinessLogic.getProductData(products);
        const requestOptions = this.getKlarnaRequestOptions();
        requestOptions.path = `/ordermanagement/v1/orders/${order_id}/captures`;
        requestOptions.method = 'POST';
        requestOptions.body = JSON.stringify({
            captured_amount: orderData.order_amount,
            reference: orderData.reference
        });

        return new Promise((resolve, reject) => {
            RESTService.getJSON(requestOptions, (resCode, obj) => {
                resCode === 201 ? resolve(obj) : reject(obj);
            });
        });
    }
    //CREATE KLARNA SESSION START
    static getSessionBody(productId) {
        const products = BusinessLogic.getProducts(productId);
        const { order_amount, order_tax_amount, order_lines } = BusinessLogic.getProductData(products);
        return JSON.stringify({
            "purchase_country": config.klarna.purchase_country,
            "purchase_currency": config.klarna.purchase_currency,
            "locale": config.klarna.locale,
            order_amount,
            order_tax_amount,
            order_lines
        });
    }

    static createSessionPromise(productId) {
        const sessionBody = this.getSessionBody(productId);

        const requestOptions = this.getKlarnaRequestOptions();

        requestOptions.path = '/payments/v1/sessions';
        requestOptions.method = 'POST';
        requestOptions.body = sessionBody;

        return new Promise((resolve, reject) => {
            RESTService.getJSON(requestOptions, (resCode, obj) => {
                resCode === 200 ? resolve(obj) : reject(obj);
            });
        });
    }

    static getKlarnaSessionToken(productID, callback = () => { }) {
        const products = BusinessLogic.getProducts(productID);
        const { order_amount, order_tax_amount, order_lines } = BusinessLogic.getProductData(products);

        const orderPromise = this.createSessionPromise(productID);
        orderPromise
            .then((response) => {
                const paymentCategories = response.payment_method_categories;
                const PREFERRED_PAYMENT_CATEGORY = 'pay_now'; // static from Klarnas API.
                let identifier = null;
                for (let i in paymentCategories) {
                    if (paymentCategories[i].identifier === PREFERRED_PAYMENT_CATEGORY) {
                        identifier = paymentCategories[i].identifier;
                    }
                }
                identifier = identifier ? identifier : paymentCategories[0].identifier; // Fall back
                
                callback(response.client_token, identifier);
            })
            .catch((err) => { console.error(err); });
    }
    //CREATE KLARNA SESSION END

    //CREATE KLARNA CUSTOMER TOKEN START
    static getCustomerTokenBody() {
        return JSON.stringify({
            "purchase_country": config.klarna.purchase_country,
            "purchase_currency": config.klarna.purchase_currency,
            "locale": config.klarna.locale,
            "description": 'KLARNA Subscription',
            "intended_use": 'SUBSCRIPTION',
            "merchant_urls": {
                "confirmation": 'https://www.framgangsakademin.se/users/sign_in'//`${config.root_url}/confirmation?session_id={}`,
            }
        });
    }

    static createAuthTokenPromise(authorization_token) {
        const sessionBody = this.getCustomerTokenBody();

        const requestOptions = this.getKlarnaRequestOptions();

        requestOptions.path = `/payments/v1/authorizations/${authorization_token}/customer-token`;
        requestOptions.method = 'POST';
        requestOptions.body = sessionBody;
        return new Promise((resolve, reject) => {
            RESTService.getJSON(requestOptions, (resCode, obj) => {
                resCode === 200 ? resolve(obj) : reject(obj);
            });
        });
    }

    static createCustomerToken(req, res, authorization_token, callback = () => { }) {
        this.createAuthTokenPromise(authorization_token)
            .then((create_customer_response) => {
                callback(create_customer_response);
                //@devmattb CUSTOMER_TOKEN + USER_ID
            })
            .catch(err => {
                console.error('Error:', err);
            });
    }
    //CREATE KLARNA CUSTOMER TOKEN END

    //CREATE KLARNA ORDER START
    //USING TOKEN_ID CREATED IN createCustomerToken()
    static getCreateOrderBody(productId) {
        const products = BusinessLogic.getProducts(productId);
        const { order_amount, order_tax_amount, order_lines } = BusinessLogic.getProductData(products);
        return JSON.stringify({
            "purchase_country": config.klarna.purchase_country,
            "purchase_currency": config.klarna.purchase_currency,
            "locale": config.klarna.locale,
            "auto_capture": true,
            order_amount,
            order_tax_amount,
            order_lines
        });
    }

    static createCustomerOrderPromise(token_id, productId) {
        const orderBody = this.getCreateOrderBody(productId);
        const requestOptions = this.getKlarnaRequestOptions();

        requestOptions.path = `/customer-token/v1/tokens/${token_id}/order`;
        requestOptions.method = 'POST';
        requestOptions.body = orderBody;

        return new Promise((resolve, reject) => {
            RESTService.getJSON(requestOptions, (resCode, obj) => {
                resCode === 200 ? resolve(obj) : reject(obj);
            });
        });
    }

    static createCustomerOrder({ req, res, customer_token, product_ID, order_amount }, callback) {
        this.createCustomerOrderPromise(customer_token, product_ID)
            .then((create_order_response) => {
                if (process.env.NODE_ENV === 'production') {
                    const ref = ThinkificService.readReferenceCode(req);
                    if (ref) {
                        const data = {
                            ref: ref,
                            order_id: create_order_response.order_id,
                            amount: parseInt(order_amount) / 100, // Remove extra "00" from unit_price
                            customer_id: customer_token,
                            meta_data: {}
                        };
                        TapfiliateService.convert(data);
                    }
                }
                callback({ create_order_response, customer_token });
            })
            .catch(err => {
                console.error('createCustomerOrder:', err);
            });
    }

    static chargeCustomerToken(subscription_data, callback) {
        const customer_token = subscription_data.subscription.customer_token;
        const product_ID = subscription_data.subscription.product_ID ? subscription_data.subscription.product_ID : PRODUCTS[0].product_ID; // Fall back to monthly product if all else fails...
        this.createCustomerOrderPromise(customer_token, product_ID)
            .then((create_order_response) => {
                if (process.env.NODE_ENV === 'production') {
                    const amount = BusinessLogic.getProducts(product_ID)[0].unit_price;
                    const ref = subscription_data.affiliate_code;
                    if (ref) {
                        const data = {
                            ref: ref,
                            order_id: create_order_response.order_id,
                            amount: parseInt(amount) / 100, // Remove extra "00" from unit_price
                            customer_id: customer_token,
                            meta_data: {}
                        };
                        TapfiliateService.convert(data);
                    }
                }
                callback({ create_order_response, customer_token});
            })
            .catch(err => {
                console.error('chargeCustomerToken:', err);
            });
    }
    //CREATE KLARNA ORDER USING CUSTOMER TOKEN END
}

export default KlarnaAPIService;
