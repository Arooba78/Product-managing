const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'http://localhost:9200' 
});
client.ping()
  .then(() => console.log('Elasticsearch is up!'))
  .catch(err => console.error('Elasticsearch is down!', err));

module.exports = client;