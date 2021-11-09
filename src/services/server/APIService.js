import config from '../../config';

class APIService {

    static getBasicAuth(apiConfigName) {
        const username = config[apiConfigName].publicKey;
        const password = config[apiConfigName].secretKey;
        const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
        return auth;
    }

    static getRequestOptions(apiConfigName, headers) {
        return {
            host: config[apiConfigName].baseUrl,
            port: 443, // default 443 for HTTP
            path: '', // e.g. '/checkout/v3/orders', usually set in a method
            method: '', // 'GET', 'POST', usually set in a method
            body: '', // {} JSON raw mostly, usually set in a method
            headers
        };
    }

    static throwError(reject, err) {
        console.error(err);
        reject(err);
    } 
}

export default APIService;