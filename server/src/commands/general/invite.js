const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {stripIndents} = require('common-tags');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      aliases: ['inv'],
      group: 'general',
      memberName: 'invite',
      description: 'Shows bot invite link.',
    });
  }

  async run(message) {
    const app = await this.client.fetchApplication();

    const embed = new MessageEmbed()
      .setAuthor(this.client.user.tag, app.iconURL())
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(0x4287f5)
      .setTitle('Invite GetMembers+ to your server')
      .setDescription(stripIndents`
        **Official Group:**
        ${this.client.options.invite}

        **Invite me to your server with this invite link:**
        https://discordapp.com/api/oauth2/authorize?client_id=${app.id}&permissions=8&scope=bot
      `);

    message.embed(embed);
  }
};
