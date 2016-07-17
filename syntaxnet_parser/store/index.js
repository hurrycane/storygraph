const Promise = require('bluebird');
const flatten = require('lodash.flatten');
const neo4j = require('node-neo4j');
const rp = require('request-promise');
const keyBy = require('lodash.keyby');
const redis = require('redis');

const rClient = redis.createClient('redis://pub-redis-17288.us-east-1-2.5.ec2.garantiadata.com:17288');
const db = new neo4j('http://neo4j:1234@localhost:7474');

db.cypherQueryAsync = Promise.promisify(db.cypherQuery, db);

const sample = require('./parsed.json');

const POS = {
	'ADJ': true,
	'ADP': true,
	'ADV': true,
	'AUX': true,
	'CONJ': true,
	'DET': true,
	'INTJ': true,
	'NOUN': true,
	'NUM': true,
	'PART': true,
	'PRON': true,
	'PROPN': true,
	'PUNCT': true,
	'SCONJ': true,
	'SYM': true,
	'VERB': true,
	'X': true,
};

function bootstrap() {
  return Promise.all(
    Object.keys(POS).map(pos => new Promise((resolve, reject) => {
      db.cypherQuery(`CREATE INDEX ON :${pos}(word)`, (err, res) => {
        if (err) return reject(err);
        resolve();
      });
    }))
  );
}

function createNode(node) {
	return new Promise((resolve, reject) => {
    db.cypherQuery(
      `MERGE (n:${node.cpostag} {word: "${node.form}"}) RETURN n;`
    , (err, res) => {
      if (err) return reject(err);
      const dbNode = res.data[0];
      return resolve(
        Object.assign({}, dbNode, node)
      );
    });
  });
}

function createRelations(node, dbNodes) {
  const nId = dbNodes[node.id].sid;
  const mId = dbNodes[node.head].sid;

  db.cypherQuery(`
    MATCH n, m WHERE n=ID(${nId}) AND m=ID(${mId})
    CREATE n -[:${node.cpostag}]->m
  `);

  if (node.cpostag === 'VERB') {
    db.cypherQuery(`
      MATCH n, m WHERE n=ID(${nId}) AND m=ID(${mId})
      CREATE n -[:${node.word.toUpperCase()}]->m
    `);
  }
}

module.exports = {
  sample,

  indexSyntaxnetGraph: Promise.coroutine(function*(nodes) {
    nodes = nodes.filter(n => n.cpostag in POS);

    // create all the nodes, indexed by POS
    const dbNodes = keyBy(yield Promise.all(nodes.map(createNode)), 'id');

    // create all the edges for all verbs
    yield Promise.all(nodes.map(node => createRelations(node, dbNodes)));

    // prune the node
    yield db.removeNodeByLabel('ADP');
    yield db.removeNodeByLabel('DET');
    yield db.removeNodeByLabel('DET');
  }),
};
