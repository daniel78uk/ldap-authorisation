const R = require('ramda');
const group = require('./group');

const getRequestDetails = req => (req.requestId || '') + ' ' + req.username;
const groupNamesFromLDAP = R.compose(
  R.map(R.replace(/^[a-zA-Z]+=([^,]+)(,.+)?$/i, '$1')),
  R.pluck('distinguishedName')
);

function getUserNameFromRequest(req) {
  const token = req.headers.authorization.split(' ')[1];
  const tokenString = new Buffer(decodeURIComponent(token), 'base64').toString('ascii')
  return tokenString.split(':')[0];
}

const getGroups = logger => (req, res, next) => {
  if (req.headers.authorization) {
    req.username = getUserNameFromRequest(req);
    const requestDetails = getRequestDetails(req);
    logger.info(requestDetails + ' Getting groups for user', req.username)
    if (req.username) {
      group.getGroups(req.username, logger)
        .then(groups => {
          req.groups = groupNamesFromLDAP(groups);
          next();
        })
        .catch(error => {
          logger.error(requestDetails + ' Error getting groups for user', error)
          res.sendStatus(401);
        });
    } else {
      logger.info(req.requestId + ' Request made with no user in token')
      res.sendStatus(401);
    }
  } else {
    logger.info(req.requestId + ' Request made with no authorization token')
    res.sendStatus(401);
  }
};

const inGroups = (groups, logger) => (req, res, next) => {
  const requestDetails = getRequestDetails(req);
  const userGroups = req.groups;
  if (R.intersection(userGroups, groups).length) {
    logger.info(requestDetails + ' User access granted', req.username)
    next();
  } else {
    logger.info(requestDetails + ' User access denied', req.username)
    res.sendStatus(401);
  }
};

const getHeaders = req => ({ user: req.username, groups: req.groups })

module.exports = {
  getGroups,
  inGroups,
  getHeaders
};
