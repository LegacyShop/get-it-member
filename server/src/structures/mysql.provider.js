/**
 * MySQLProvider for Discord.js-Commando
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-discord.js-commando-mysqlprovider
 * License: MIT
*/

const {SettingProvider} = require('discord.js-commando');

/**
 * Uses an MySQL database to store settings with guilds
 * @extends {SettingProvider}
 */
class MySQLProvider extends SettingProvider {
  /**
	 * @external PromiseConnection
	 * @see {@link https://www.npmjs.com/package/mysql2}
	 */

  /**
	 * @param {PromiseConnection} db - MySQL Connection for the provider
	 */
  constructor(db) {
    super();

    /**
		 * MySQL Connection that will be used for storing/retrieving settings
		 * @type {PromiseConnection}
		 */
    this.db = db;

    /**
		 * Client that the provider is for (set once the client is ready, after using {@link CommandoClient#setProvider})
		 * @name SQLiteProvider#client
		 * @type {CommandoClient}
		 * @readonly
		 */
    Object.defineProperty(this, 'client', {value: null, writable: true});

    /**
		 * Settings cached in memory, mapped by guild ID (or 'global')
		 * @type {Map}
		 * @private
		 */
    this.settings = new Map();

    /**
		 * Listeners on the Client, mapped by the event name
		 * @type {Map}
		 * @private
		 */
    this.listeners = new Map();
  }

  async init(client) {
    this.client = client;
    await this.db.execute('CREATE TABLE IF NOT EXISTS `settings` (`guild` VARCHAR(20) NOT NULL, `settings` TEXT NOT NULL , PRIMARY KEY (`guild`))');

    // Load all settings
    const rows = await this.db.execute('SELECT guild, settings FROM settings').then(res => res[0]);
    for (const row of rows) {
      let settings;
      try {
        settings = JSON.parse(row.settings);
      } catch (err) {
        client.emit('warn', `MySQLProvider couldn't parse the settings stored for guild ${row.guild}.`);
        continue;
      }

      const guild = row.guild !== '0' ? row.guild : 'global';
      this.settings.set(guild, settings);

      if (guild !== 'global' && !client.guilds.cache.has(row.guild)) {
        continue;
      }

      this.setupGuild(guild, settings);
    }

    // Listen for changes
    this.listeners
      .set('commandPrefixChange', (guild, prefix) => {
        this.set(guild, 'prefix', prefix);
      })
      .set('commandStatusChange', (guild, command, enabled) => {
        this.set(guild, `cmd-${command.name}`, enabled);
      })
      .set('groupStatusChange', (guild, group, enabled) => {
        this.set(guild, `grp-${group.id}`, enabled);
      })
      .set('guildCreate', guild => {
        const settings = this.settings.get(guild.id);
        if (!settings) {
          return;
        }

        this.setupGuild(guild.id, settings);
      })
      .set('commandRegister', command => {
        for (const [guild, settings] of this.settings) {
          if (guild !== 'global' && !client.guilds.cache.has(guild)) {
            continue;
          }

          this.setupGuildCommand(client.guilds.cache.get(guild), command, settings);
        }
      })
      .set('groupRegister', group => {
        for (const [guild, settings] of this.settings) {
          if (guild !== 'global' && !client.guilds.cache.has(guild)) {
            continue;
          }

          this.setupGuildGroup(client.guilds.cache.get(guild), group, settings);
        }
      });

    for (const [event, listener] of this.listeners) {
      client.on(event, listener);
    }
  }

  async destroy() {
    // Remove all listeners from the client
    for (const [event, listener] of this.listeners) {
      this.client.removeListener(event, listener);
    }

    this.listeners.clear();
  }

  get(guild, key, defVal) {
    const settings = this.settings.get(this.constructor.getGuildID(guild));
    return (settings ? (typeof settings[key] !== 'undefined' ? settings[key] : defVal) : defVal);
  }

  async set(guild, key, val) {
    guild = this.constructor.getGuildID(guild);
    let settings = this.settings.get(guild);

    if (!settings) {
      settings = {};
      this.settings.set(guild, settings);
    }

    settings[key] = val;

    await this.db.execute('REPLACE INTO settings VALUES(?, ?)', [guild !== 'global' ? guild : 0, JSON.stringify(settings)]);
    if (guild === 'global') {
      this.updateOtherShards(key, val);
    }

    return val;
  }

  async remove(guild, key) {
    guild = this.constructor.getGuildID(guild);
    const settings = this.settings.get(guild);

    if (!settings || typeof settings[key] === 'undefined') {
      return undefined;
    }

    const val = settings[key];
    settings[key] = undefined;
    await this.db.execute('REPLACE INTO settings VALUES(?, ?)', [guild !== 'global' ? guild : 0, JSON.stringify(settings)]);

    if (guild === 'global') {
      this.updateOtherShards(key, undefined);
    }

    return val;
  }

  async clear(guild) {
    guild = this.constructor.getGuildID(guild);
    if (!this.settings.has(guild)) {
      return;
    }

    this.settings.delete(guild);
    await this.db.execute('DELETE FROM settings WHERE guild = ?', [(guild !== 'global' ? guild : 0)]);
  }

  /**
	 * Loads all settings for a guild
	 * @param {string} guild - Guild ID to load the settings of (or 'global')
	 * @param {Object} settings - Settings to load
	 * @private
	 */
  setupGuild(guild, settings) {
    if (typeof guild !== 'string') {
      throw new TypeError('The guild must be a guild ID or "global".');
    }

    guild = this.client.guilds.cache.get(guild) || null;

    // Load the command prefix
    if (typeof settings.prefix !== 'undefined') {
      if (guild) {
        guild._commandPrefix = settings.prefix;
      } else {
        this.client._commandPrefix = settings.prefix;
      }
    }

    // Load all command/group statuses
    for (const command of this.client.registry.commands.values()) {
      this.setupGuildCommand(guild, command, settings);
    }

    for (const group of this.client.registry.groups.values()) {
      this.setupGuildGroup(guild, group, settings);
    }
  }

  /**
	 * Sets up a command's status in a guild from the guild's settings
	 * @param {?Guild} guild - Guild to set the status in
	 * @param {Command} command - Command to set the status of
	 * @param {Object} settings - Settings of the guild
	 * @private
	 */
  setupGuildCommand(guild, command, settings) {
    if (typeof settings[`cmd-${command.name}`] === 'undefined') {
      return;
    }

    if (guild) {
      if (!guild._commandsEnabled) guild._commandsEnabled = {};
      guild._commandsEnabled[command.name] = settings[`cmd-${command.name}`];
    } else {
      command._globalEnabled = settings[`cmd-${command.name}`];
    }
  }

  /**
	 * Sets up a group's status in a guild from the guild's settings
	 * @param {?Guild} guild - Guild to set the status in
	 * @param {CommandGroup} group - Group to set the status of
	 * @param {Object} settings - Settings of the guild
	 * @private
	 */
  setupGuildGroup(guild, group, settings) {
    if (typeof settings[`grp-${group.id}`] === 'undefined') {
      return;
    }

    if (guild) {
      if (!guild._groupsEnabled) guild._groupsEnabled = {};
      guild._groupsEnabled[group.id] = settings[`grp-${group.id}`];
    } else {
      group._globalEnabled = settings[`grp-${group.id}`];
    }
  }

  /**
	 * Updates a global setting on all other shards if using the {@link ShardingManager}.
	 * @param {string} key - Key of the setting to update
	 * @param {*} val - Value of the setting
	 * @private
	 */
  updateOtherShards(key, val) {
    if (!this.client.shard) {
      return;
    }

    key = JSON.stringify(key);
    val = (typeof val !== 'undefined' ? JSON.stringify(val) : 'undefined');

    this.client.shard.broadcastEval(`
			if(this.shard.id !== ${this.client.shard.id} && this.provider && this.provider.settings) {
				this.provider.settings.global[${key}] = ${val};
			}
		`);
  }
}

module.exports = MySQLProvider;
