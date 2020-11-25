const Event = require('../structures/Event');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'guildMemberAdd',
    });
  }

  async run(member) {
    const {guild} = member;
    const cachedInvites = this.client.guildCachedInvites[guild.id];

    if (!cachedInvites) {
      return;
    }

    let usedInvite = null;
    const invites = await guild.fetchInvites().catch(() => null);
    if (invites) {
      cachedInvites.forEach(cachedInvite => {
        invites.forEach(invite => {
          if (cachedInvite.code === invite.code && cachedInvite.uses < invite.uses) {
            usedInvite = invite;
          }
        });
      });
    }

    if (!usedInvite) {
      return;
    }

    this.client.guildCachedInvites[guild.id] = [...invites.values()];

    const config = this.client.getConfig();
    const advertise = await (new Promise(resolve => {
      this.client.db.advertises.findOne({
        inviteLink: usedInvite.toString(),
      }, (error, advertise) => resolve(advertise));
    }));

    if (advertise) {
      const joinedMemberAccount = await this.client.getAccount(member.user);
      const officialServer = this.client.guilds.cache.get(config.officialServer);
      const officialMember = officialServer.members.fetch(member.id).catch(() => null);
      let rewardMultiplier = 1;
      if (officialMember) {
        rewardMultiplier = config.joinServerRewardMultiplier;
      }

      const balanceBefore = joinedMemberAccount.balance;
      joinedMemberAccount.balance += advertise.joinReward * rewardMultiplier;
      joinedMemberAccount.joinedServers[guild.id] = {
        reward: advertise.joinReward * rewardMultiplier,
        joinedAt: Date.now(),
      };
      this.client.addLog(joinedMemberAccount, {
        balanceBefore,
        balanceAfter: joinedMemberAccount.balance,
        info: `Joined ${guild.name} server from +find`,
      });
      await this.client.saveAccount(joinedMemberAccount);

      advertise.joinedMembers.push(member.id);
      // Remove advertise if invites count reached purchased invites
      if (advertise.joinedMembers.length >= advertise.purchasedInvites) {
        this.client.db.advertises.remove({
          _id: this.client.db.ObjectId(advertise._id),
        });
      } else {
        this.client.db.advertises.save(advertise);
      }
    }
  }
};
