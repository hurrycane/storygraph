const express = require('express');
const bodyParser = require('body-parser');
const app = module.exports = express();

// Setting up middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.post('/syntaxnet', (req, res, next) => {
  req.body.input.then(() => {
  });
});

app.listen(3000, '0.0.0.0');
