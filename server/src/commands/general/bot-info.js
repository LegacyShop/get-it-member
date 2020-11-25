const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const moment = require('moment');
const {stripIndents} = require('common-tags');
const discordVersion = require('discord.js').version;
const finixVersion = require('../../../../package.json').version;

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'bot-info',
      aliases: ['bot'],
      group: 'general',
      memberName: 'bot-info',
      description: 'Displays information about this bot.',
    });
  }

  async run(message) {
    const app = await this.client.fetchApplication();

    const embed = new MessageEmbed()
      .setAuthor(this.client.user.tag, app.iconURL())
      .setColor(0x4287f5)
      .setDescription(stripIndents`
        **Developers:** ${this.client.owners.join(', ')}
        **Client ID:** ${app.id}
        **Creation Date:** ${moment.utc(app.createdAt).format('DD.MM.YYYY')} (${moment(app.createdAt).fromNow()})

        **Version**: v${finixVersion}
        **Discord.js Version**: v${discordVersion}
        **Node.js Version**: ${process.version}

        **Uptime**: ${moment.utc(this.client.uptime).format('H:mm:ss')}
        **Memory Usage**: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB

        **Server Count:** ${this.client.guilds.cache.size}
        **Member Count:** ${this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}
        **Channel Count:** ${this.client.channels.cache.size}

        **Official Group:**
        ${this.client.options.invite}

        **Click here to add me to your server:**
        https://discordapp.com/api/oauth2/authorize?client_id=${app.id}&permissions=8&scope=bot
      `);

    message.embed(embed);
  }
};
