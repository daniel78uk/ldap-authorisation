'use strict';

process.env.AD_LOCATION="ldap://localhost:1389"
process.env.AD_BIND_ACCOUNT="cn=root"
process.env.AD_BIND_PASSWORD="secret"
process.env.AD_SEARCH_ROOT="o=test"
process.env.AD_USERNAME_KEY="SAMAccountName"

const assert = require('assert');
const makeReq = require('./make-request');
const ldapAuth = require('../index');
const mockLDAPServer = require('./mock-ldap-server');
const app = require('./testapp/app');

const scottsEncodedHeader = 'Basic c2NvdHRzOk5PUEFTU1dPUkQ=';

describe('Get groups', () => {

	before(mockLDAPServer.start);

	after(mockLDAPServer.stop);

	it('should authenticate user with correct header', () => {
		return makeReq.get('/test', { authorization: scottsEncodedHeader })
			.then(res => {
				assert.equal(res.status, 200);
				assert.deepEqual(res.body.status, 'OK');
			});
	});

	it('should attach groups to request', () => {
		return makeReq.get('/return-request-groups', { authorization: scottsEncodedHeader })
			.then(res => {
				assert.equal(res.status, 200);
				assert.deepEqual(res.body, ['Water', 'Fire', 'Ice']);
			});
	});

	it('should not authenticate user with incorrect header', () => {
		return makeReq.get('/test', { authorization: 'Basic xxxxx' })
			.then(res => {
				assert.equal(true, false);
			})
			.catch(res => {
				assert.equal(res.status, 401);
			});
	});

	it('should not authenticate user with no header', () => {
		return makeReq.get('/test', {})
			.then(res => {
				assert.equal(true, false);
			})
			.catch(res => {
				assert.equal(res.status, 401);
			});
	});

});
