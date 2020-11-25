const moment = require('moment');
const {MessageEmbed} = require('discord.js');
const {stripIndents} = require('common-tags');
const Event = require('../structures/Event');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'guildDelete',
    });
  }

  async run(guild) {
    const channelId = this.client.config.get('inviteLogChannel');
    const channel = await this.client.channels.fetch(channelId).catch(() => null);

    if (!channel) {
      return;
    }

    const embed = new MessageEmbed()
      .setTitle('Guild removed')
      .setColor(0xff0d3d)
      .setDescription(stripIndents`
        **Name:** ${guild.name}
        **Owner:** ${guild.owner}
        **Members:** ${guild.memberCount}
        **Creation Date:** ${moment.utc(guild.createdAt).format('DD.MM.YYYY')}
      `)
      .setFooter(`${this.client.guilds.cache.size} guilds`)
      .setTimestamp();

    channel.send(embed);
  }
};
