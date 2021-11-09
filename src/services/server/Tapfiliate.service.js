const fetch = require('node-fetch');
import config from '../../config';

class TapfiliateService {
	static createRequestBody({ ref, order_id, amount, customer_id, meta_data }) {
		return {
			referral_code: ref,
			external_id: order_id,
			amount: amount,
			customer_id: customer_id,
			program_group: config.tapfiliate.programGroup,
			currency: 'SEK',
			meta_data: meta_data
		};
	}

	static createConversion(body) {
		const url = 'https://api.tapfiliate.com/1.6/conversions/';
		const headers = { 'Content-Type': 'application/json', 'Api-Key': config.tapfiliate.apiKey };
		const request = { method: 'post', body: JSON.stringify(body), headers: headers };
		fetch(url, request)
			.then((res) => res.json()).catch(e => console.error("createConversion", e))
			.then(console.log).catch(e => console.error("createConversion", e));
	}

	static convert(data) {
		const body = this.createRequestBody(data);
		this.createConversion(body);
	}
}

export default TapfiliateService;
