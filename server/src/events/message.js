const Event = require('../structures/Event');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'message',
    });
  }

  async run(message) {
    if (!message.guild) {
      return;
    }

    const config = this.client.getConfig();
    const isBooster = (
      message.type === 'USER_PREMIUM_GUILD_SUBSCRIPTION'
      || message.type === 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1'
      || message.type === 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2'
      || message.type === 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3'
    );

    if (message.guild.id === config.officialServer && isBooster) {
      const account = await this.client.getAccount(message.author);
      const balanceBefore = account.balance;
      account.balance += config.serverBoostingReward;
      this.client.addLog(account, {
        balanceBefore,
        balanceAfter: account.balance,
        info: 'Boosted GetMembers+ Official server',
      });
      this.client.saveAccount(account);
    }
  }
};
