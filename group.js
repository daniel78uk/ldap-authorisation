'use strict';

const ensureArray = require('./ensure-array');
const ldap = require('./ldap');

function getGroups(username, logger) {
  return ldap.getUser(username, logger)
    .then(user => {
      const groups = ensureArray.toArray(user.memberOf);
      const body = groups.map(createBody.bind(null, username));

      logger.info('get groups success', {
        username: username,
        body: body
      });

      return body;
    });
}

function createBody(username, groupName) {
  return {
    url: '/users/' + username + '/groups/' + groupName,
    distinguishedName: groupName
  };
}

module.exports = {
  getGroups: getGroups
};
