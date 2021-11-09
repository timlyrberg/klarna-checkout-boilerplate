class CookieService {
	static isCookieSet(req) {
		const cookie = this.getCookie(req);
		return cookie != '';
	}

	static isNewRefCode(req, ref) {
		const cvalue = this.getCookie(req);
		return ref ? ref !== cvalue : false;
	}

	static getCookie(req) {
		return req.cookies.affiliatecode;
	}

	static setCookie(cvalue, res) {
		const cname = 'affiliatecode';
		res.cookie(cname, cvalue, { maxAge: 900000, httpOnly: true });
	}

	static runCookies(req, res) {
		const { ref } = req.query;

		if (!this.isCookieSet(req)) {
			this.setCookie(ref, res);
		}

		if (this.isNewRefCode(req, ref)) {
			this.setCookie(ref, res);
		}
	}
}

export default CookieService;
