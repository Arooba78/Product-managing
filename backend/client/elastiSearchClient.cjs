const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'http://localhost:9200' // No auth since you disabled security
});
client.ping()
  .then(() => console.log('Elasticsearch is up!'))
  .catch(err => console.error('Elasticsearch is down!', err));

module.exports = client;