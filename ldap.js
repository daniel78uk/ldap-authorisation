'use strict';

var ldap = require('ldapjs');

var AD_LOCATION = process.env.AD_LOCATION;
var AD_BIND_ACCOUNT = process.env.AD_BIND_ACCOUNT;
var AD_BIND_PASSWORD = process.env.AD_BIND_PASSWORD;
var AD_USERNAME_KEY = process.env.AD_USERNAME_KEY;
var AD_SEARCH_ROOT = process.env.AD_SEARCH_ROOT;

function getUser(username, logger) {
  return new Promise((resolve, reject) => {

    // create a new LDAP client
    const client = ldap.createClient({
      url: AD_LOCATION
    });

    // bind the LDAP client - authenticate the API
    client.bind(AD_BIND_ACCOUNT, AD_BIND_PASSWORD, function (err) {
      var options;

      // binding did fail
      if (err) {
        logger.error('ldap bind error', {
          username: username,
          error: err
        });
        client.unbind(function (err) {
          if (err) {
            logger.error('ldap unbind error', {
              username: username,
              error: err
            });
          }
        });
        reject('ldap unbind error');
      }

      // create the search options
      options = {
        filter: '(' + AD_USERNAME_KEY + '=' + username + ')',
        scope: 'sub'
      };

      // search for the user
      client.search(AD_SEARCH_ROOT, options, function (err, result) {
        var user;

        // search did fail
        if (err) {
          logger.error('ldap search error', {
            username: username,
            error: err
          });
          client.unbind(function (err) {
            if (err) {
              logger.error('ldap unbind error', {
                username: username,
                error: err
              });
            }
          });
          reject('ldap unbind error');
        }

        // a new search entry is received
        result.on('searchEntry', function (entry) {
          user = entry.object;
        });

        // search did fail
        result.on('error', function (err) {
          logger.error('ldap search error', {
            username: username,
            error: err
          });
          client.unbind(function (err) {
            if (err) {
              logger.error('ldap unbind error', {
                username: username,
                error: err
              });
            }
          });
          reject(err)
        });

        // search did end
        result.on('end', function () {

          // unbind the client
          client.unbind(function (err) {
            if (err) {
              logger.error('ldap unbind error', {
                username: username,
                error: err
              });
            }
          });

          // no user means no entry has been received
          if (!user) {
            logger.error('get user error', {
              username: username
            });
            reject('get user error');
          }

          // everything is good
          logger.info('get user success', {
            username: username,
            user: user
          });
          resolve(user);
        });
      });
    });
  });
}

module.exports = {
  getUser: getUser
};
