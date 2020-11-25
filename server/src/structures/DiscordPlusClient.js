const {CommandoClient} = require('discord.js-commando');
const BotConfig = require('./BotConfig');
const {version} = require('../../../package.json');

module.exports = class extends CommandoClient {
  constructor(options) {
    super(options);
    this.db = null;
    this.config = new BotConfig(this);
    this.guildCachedInvites = {};
  }

  async afterInitialize() {
    console.info(`Logged in as ${this.user.tag}!`);

    this.options.invite = this.config.get('invite');

    const activities = [
      () => `NEW! v${version}`,
      () => 'Use +find to start Earn!',
      () => 'Use +bal to see balance!',
      () => 'Use +buy to get members!',
      () => 'discord.gg/y4AFbt5',
    ];

    let currentIndex = 0;
    setInterval(() => {
      this.user.setActivity(
        `${this.commandPrefix}help | ${activities[currentIndex]()}`,
        {type: 'WATCHING'},
      );
      currentIndex = currentIndex + 2 > activities.length ? 0 : currentIndex + 1;
    }, 7500);


    const updateAdvertises = async () => {
      const advertises = await this.getAdvertises();
      const guildInvites = {};

      for (const advertise of advertises) {
        const guild = await this.guilds.fetch(advertise.guildId).catch(
          err => console.error(`Guild fetch failed: ${err}`),
        );

        if (!guild) {
          // Remove advertise if guild has removed the bot
          this.db.advertises.remove({
            _id: this.db.ObjectId(advertise._id),
          });
        } else {
          // Update guild cached invites and check if advertise invite link is valid
          let invites = guildInvites[guild.id];
          if (!invites) {
            invites = await guild.fetchInvites()
              .catch(err => console.error(`Invites fetch failed (guild ${guild.id}): ${err}`));
            guildInvites[guild.id] = invites;
          }
          if (invites) {
            let invite = invites.find(inv => inv.toString() === advertise.inviteLink);
            if (!invite) {
              const channel = guild.channels.cache.find(ch => ch.type === 'text');
              if (channel) {
                invite = await channel.createInvite({
                  maxAge: 0,
                  unique: true,
                  reason: 'Recreate invite for an advertise',
                }).catch(err => console.error(`Invite creation failed: ${err}`));
              }
              advertise.inviteLink = channel && invite ? invite.toString() : null;
              this.db.advertises.save(advertise);
            }
            this.guildCachedInvites[guild.id] = [...invites.values()];
          }
        }
      }

      setTimeout(updateAdvertises, 60000);
    };

    updateAdvertises();
  }

  getConfig() {
    return this.config.get(null);
  }

  getAdvertises() {
    return new Promise((resolve, reject) => {
      this.db.advertises.find((error, advertises) => {
        if (error) {
          reject(error);
        } else {
          resolve(advertises);
        }
      });
    });
  }

  getAccount(user) {
    return new Promise(resolve => {
      this.db.accounts.findOne({
        id: user.id,
      }, (err, account) => {
        if (account) {
          resolve(this.verifyAccount(account));
        } else {
          resolve(this.createAccount(user));
        }
      });
    });
  }

  verifyAccount(account) {
    if (Number.isNaN(account.balance)) {
      account.balance = 0;
    }
    if (!Array.isArray(account.logs)) {
      account.logs = [];
    }
    if (typeof account.joinedServers !== 'object') {
      account.joinedServers = {};
    }
    return account;
  }

  saveAccount(account) {
    return new Promise((resolve, reject) => {
      this.db.accounts.save(account, (error, account) => {
        if (error) {
          reject(error);
        } else {
          resolve(account);
        }
      });
    });
  }

  createAccount(user) {
    const config = this.getConfig();
    const newAccount = {
      id: user.id,
      balance: config.userStartBalance,
      lastReceivedDaily: 0,
      lastReceivedWeekly: 0,
      logs: [],
      joinedServers: {},
      createdAt: Date.now(),
    };
    return new Promise((resolve, reject) => {
      this.db.accounts.insert(newAccount, (error, account) => {
        if (error) {
          reject(error);
        } else {
          resolve(account);
        }
      });
    });
  }

  addLog(account, data) {
    const maxLogsLength = 10;
    let logs = account.logs || [];
    const lastLog = logs[logs.length - 1];
    logs.push({
      index: lastLog ? lastLog.index + 1 : 1,
      time: new Date().getTime(),
      info: data.info || '',
      balanceBefore: data.balanceBefore,
      balanceAfter: data.balanceAfter,
    });
    if (logs.length > maxLogsLength) {
      logs = logs.slice(logs.length - maxLogsLength, logs.length);
    }
    account.logs = logs;
  }
};
