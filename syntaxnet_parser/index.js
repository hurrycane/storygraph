const express = require('express');
const bodyParser = require('body-parser');
const app = module.exports = express();

const cmd = require('./cmd');
const parser = require('./parser');
const store = require('./store');
const testData = require('./test');

// Setting up middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.get('/__ping', (req, res, next) => {
  res.status(200).send('pong');
});

app.post('/syntaxnet', (req, res, next) => {
  const input = req.body.input;
  cmd.run(input).then(result => res.status(200).json(parser.parse(result)));
});

app.post('/__test', (req, res, next) => {
  const result = parser.parse(testData)
  res.status(200).json(result);
});

app.get('/__dbtest', (req, res, next) => {
  store.indexSyntaxnetGraph(store.sample).then(() => {
    res.status(200).json('meh');
  });
});


console.log('Started...');
app.listen(3033, '0.0.0.0');
