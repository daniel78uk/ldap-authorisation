'use strict';

const ldap = require('ldapjs');
const server = ldap.createServer();

server.bind('cn=root', (req, res, next) => {
	if (req.dn.toString() !== 'cn=root' || req.credentials !== 'secret') {
		return next(new ldap.InvalidCredentialsError());
	}
	res.end();
	return next();
});

server.search('o=test', function(req, res, next) {
	const obj = {
		scotts: {
			dn: req.dn.toString(),
			attributes: {
				objectclass: ['organization', 'top'],
				o: 'test',
				memberOf: [
					'CN=Water,OU=Test,DC=dev,DC=local',
					'CN=Fire,OU=Test,DC=dev,DC=local',
					'CN=Ice,OU=Test,DC=dev,DC=local'
				]
			}
		},
		userWithOneGroup: {
			dn: req.dn.toString(),
			attributes: {
				objectclass: ['organization', 'top'],
				o: 'test',
				memberOf: [
					'CN=Water,OU=Test,DC=dev,DC=local'
				]
			}
		},
		userWithTwoGroups: {
			dn: req.dn.toString(),
			attributes: {
				objectclass: ['organization', 'top'],
				o: 'test',
				memberOf: [
					'CN=Water,OU=Test,DC=dev,DC=local',
					'differentGroup',
					'CN=Fire,OU=Test,DC=dev,DC=local',
				]
			}
		}
	};
	const username = req.filter.value;

	if (username === 'error') {
		next(new ldap.NoSuchObjectError());
	}

	if (obj[username]) {
		res.send(obj[username]);
	}

	res.end();
});

server.start = (done, port) => {
	port = port || 1389;
	server.listen(port, () => {
		console.log(`LDAP server listening at ${server.url}`);
		done();
	});
}

server.stop = done => {
	server.emit('close');
	console.log(`LDAP server at ${server.url} now closed`);
	done();
}

module.exports = server;
