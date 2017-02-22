const request = require('request');
const R = require('ramda');

const getRequestDetails = req => (req.requestId || '') + ' ' + req.username;

function getUserNameFromRequest(req) {
  const token = req.headers.authorization.split(' ')[1];
  const tokenString = new Buffer(decodeURIComponent(token), 'base64').toString('ascii')
  return tokenString.split(':')[0];
}

const getGroups = (apiHost, logger) => (req, res, next) => {
  if (req.headers.authorization) {
    req.username = getUserNameFromRequest(req);
    const requestDetails = getRequestDetails(req);
    logger.info(requestDetails + ' Getting groups for user', req.username)
    if (req.username) {
      request({ url: `${apiHost}/users/${req.username}/groups`, json: true }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
          logger.error(requestDetails + ' Error getting groups for user', error)
          res.sendStatus(401);
        } else {
          const groups = R.pluck('distinguishedName', body)
          req.groups = groups;
          next();
        }
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

const addHeadersToReq = logger => (req, res, next) => {
  req.groups = req.headers.groups;
  req.username = req.headers.user;
  if (req.groups && req.username) {
    const requestDetails = getRequestDetails(req);
    logger.info(requestDetails + ' User details found');
    next();
  } else {
    logger.info(req.requestId + ' User details not found, access denied');
    res.sendStatus(401);
  }
};

const getHeaders = req => ({ user: req.username, groups: req.groups })

module.exports = {
  getGroups,
  inGroups,
  getHeaders,
  addHeadersToReq
};
