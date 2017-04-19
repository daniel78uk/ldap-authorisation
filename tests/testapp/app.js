const express = require('express');
const auth = require('../../index');

const app = express();

app.use((req, res, next) => {
  req.requestId = req.query.requestId || 'No Request Id';
  next();
});

const authLogger = {
  info: () => '',
  error: () => ''
};

app.use(auth.getGroups(authLogger));

app.use(auth.inGroups(['Water'], authLogger));

app.get('/test', (req, res) => res.send({ status: 'OK'}));

app.get('/return-request-groups', (req, res) => res.send(req.groups));

app.listen(3015);

module.exports = app;
