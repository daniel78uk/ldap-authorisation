const request = require('superagent');

const APP_URL = 'http://localhost:3015';

function get(resource, headers) {
	return new Promise((resolve, reject) => {
		request
			.get(APP_URL + resource)
			.set(headers)
			.end((err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			})
	})
}

module.exports = {
	get: get
}
