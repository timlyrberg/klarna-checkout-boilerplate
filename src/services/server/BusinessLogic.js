import config from '../../config';
import { PRODUCTS } from '../../static/Products.js';

class BusinessLogic {

	static getProducts(productId) {
		return PRODUCTS.filter((product) => product.product_ID === productId);
	}

	static getQuantity() {
		return 1;
	}

	static getTaxRate() {
		const tax_rate = 2500; // swedish moms rate 25%
		return tax_rate;
	}

	static getTotalTaxAmount(product, quantity) {
		const tax_rate = this.getTaxRate();
		const total_amount = product.unit_price * quantity;
		const total_tax_amount = total_amount - total_amount * 10000 / (10000 + tax_rate);
		return total_tax_amount;
	}

	static createOrderline(product) {
		const quantity = this.getQuantity();
		const tax_rate = this.getTaxRate();
		const total_tax_amount = this.getTotalTaxAmount(product, quantity);
		const total_amount = (product.unit_price * quantity) - product.total_discount_amount;
		return {
			"type": product.type,
			"reference": product.reference,
			"name": "Framgångsakademin - Gold Standard", // TODO: Make dynamic again and make sure it doesnt break anything with XX_monthly_XX : product.name,
			"quantity": quantity,
			"quantity_unit": "st",
			"image_url": 'null',
			"unit_price": product.unit_price,
			"tax_rate": tax_rate,
			"total_amount": total_amount,
			"total_discount_amount": product.total_discount_amount, //TODO get the total_discount_amount from item instead
			"total_tax_amount": total_tax_amount,
		};
	}

	static getProductData(products) {
		const order_lines = products.map((product) => this.createOrderline(product));
		const order_amount = order_lines.reduce((acc, curr) => acc + curr.total_amount, 0);
		const order_tax_amount = order_lines.reduce((acc, curr) => acc + curr.total_tax_amount, 0);
		return {
			order_amount,
			order_tax_amount,
			order_lines
		};
	}
}

export default BusinessLogic;
