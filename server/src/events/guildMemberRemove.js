const Event = require('../structures/Event');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'guildMemberRemove',
    });
  }

  async run(member) {
    const {guild} = member;
    const account = await this.client.getAccount(member.user);
    const joinedServerInfo = account.joinedServers[guild.id];

    if (!joinedServerInfo) {
      return;
    }

    let leavedServer = await (new Promise(resolve => {
      this.client.db.advertises.findOne({
        guildId: guild.id,
      }, (error, advertise) => resolve(advertise));
    }));

    if (leavedServer) {
      const joinedMemberIndex = leavedServer.joinedMembers.indexOf(member.id);
      if (joinedMemberIndex !== -1) {
        leavedServer.joinedMembers.splice(joinedMemberIndex, 1);
        this.client.db.advertises.save(leavedServer);
      }
    }
    // h * 60m * 60s * 1000ms
    const config = this.client.getConfig();
    const timeBeforeLeavingServer = config.hoursBeforeLeavingServer * 60 * 60 * 1000;
    if (Date.now() - joinedServerInfo.joinedAt < timeBeforeLeavingServer) {
      const balanceBefore = account.balance;
      account.balance -= joinedServerInfo.reward * config.leavingPenaltyPercentage;
      this.client.addLog(account, {
        balanceBefore,
        balanceAfter: account.balance,
        info: `Left ${guild.name} server before 3 days passed`,
      });
    }

    delete account.joinedServers[guild.id];
    await this.client.saveAccount(account);
  }
};
