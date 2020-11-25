const express = require('express');
const http = require('http');
const requireAll = require('require-all');
const mongojs = require('mongojs');
const MySQL = require('mysql2/promise');
const routes = require('./src/routes');
const DiscordPlusClient = require('./src/structures/DiscordPlusClient');
const MySQLProvider = require('./src/structures/mysql.provider');
const config = require('../config.json');

require('dotenv').config();

const client = new DiscordPlusClient({
  commandPrefix: config.commandPrefix,
  owner: config.owners,
  invite: config.invite,
  disabledEvents: ['TYPING_START'],
  partials: ['MESSAGE', 'REACTION'],
});

client
  .on('error', console.error)
  .on('warn', console.warn)
  .on('debug', console.debug)
  .on('shardDisconnected', (event, id) => console.log(`Shard "${id}" disconnected. ${new Date().toLocaleString()}`))
  .on('shardError', (error, id) => console.log(`Shard "${id}" ${error}. ${new Date().toLocaleString()}`))
  .on('shardReady', id => console.log(`Shard "${id}" ready. ${new Date().toLocaleString()}`))
  .on('shardReconnecting', id => console.log(`Shard "${id}" reconnecting. ${new Date().toLocaleString()}`))
  .on('shardResume', id => console.log(`Shard "${id}" resume. ${new Date().toLocaleString()}`))
  .on('commandError', (cmd, err) => console.error(`Error in command ${cmd.memberName}: ${err}. ${new Date().toLocaleString()}`));

process.on('unhandledRejection', err => console.error(err));


// Main database
const db = mongojs(process.env.DATABASE, ['accounts', 'advertises', 'gifts']);
db.on('connect', async () => {
  console.log('Database successfully connected.');
});
db.on('error', error => {
  console.error('Database error:', error);
});
client.db = db;


// Client initialization
const mysqlDB = MySQL.createPool({
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  charset: 'utf8mb4_unicode_ci',
});
client.setProvider(new MySQLProvider(mysqlDB))
  .then(() => client.afterInitialize());
client.login(process.env.TOKEN);

const events = requireAll({
  dirname: `${__dirname}/src/events/`,
  resolve: Event => new Event(client),
});
Object.values(events).forEach(event => {
  client.on(event.name, event.run.bind(event));
});

client.registry
  .registerDefaultTypes()
  .registerDefaultGroups()
  .registerDefaultCommands({
    unknownCommand: false,
    help: false,
  })
  .registerGroups([
    ['devtools', 'Devtools'],
    ['general', 'General'],
    ['moderation', 'Moderation'],
    ['economy', 'Economy'],
  ])
  .registerCommandsIn(`${__dirname}/src/commands/`);


// Website
const app = express();
const httpServer = http.Server(app);
const port = process.env.PORT || 5000;

app.set('port', port);

httpServer.listen(port, error => {
  if (error) throw error;

  routes.set(app, express);

  console.log(`Website started on port ${port}.`);
});
