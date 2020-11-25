const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const moment = require('moment');
const {stripIndents} = require('common-tags');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'check',
      group: 'economy',
      memberName: 'check',
      description: 'View if you can leave from the server.',
    });
  }

  async run(message) {
    const config = this.client.getConfig();
    const account = await this.client.getAccount(message.author);

    // h * 60m * 60s * 1000ms
    const timeBeforeLeavingServer = config.hoursBeforeLeavingServer * 60 * 60 * 1000;
    const joinedServerInfo = account.joinedServers[message.guild.id];
    const canLeave = !joinedServerInfo || Date.now() - joinedServerInfo.joinedAt
      > timeBeforeLeavingServer;
    const embed = new MessageEmbed()
      .setTitle(canLeave
        ? `${config.hoursBeforeLeavingServer} hours passed.`
        : `You can leave in ${moment(joinedServerInfo.joinedAt + timeBeforeLeavingServer).fromNow(true)}
      `)
      .setColor(0x03a9f4);

    if (!canLeave) {
      embed.setDescription(stripIndents`
        You will lose ${joinedServerInfo.reward * config.leavingPenaltyPercentage} ADV coins.
      `);
    }

    message.say(embed);
  }
};
