const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {stripIndents} = require('common-tags');

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'giveaways',
      aliases: ['gw'],
      group: 'economy',
      memberName: 'giveaways',
      description: 'There are you can join on GetMembers+ server and join on giveaway',
      details: 'The command will send you link to discord giveaways channel.'
    });
  }

  async run(message) {
    const embed = new MessageEmbed()
      .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
      .setTitle('GetMembers+ Giveaways')
      .setColor('#f47fff')
      .setDescription(stripIndents`
        Links to the official giveaways!
        <a:tada:761911248140238889> • __Giveaways for everyone__: <https://discord.gg/tRTmk5K>
        <a:tada:761911248140238889> • __Giveaways for boosters__: <https://discord.gg/H4FVpdQ>
        <a:tada:761911248140238889> • __Giveaways for supporters__: <https://discord.gg/xFtE4MC>
      `);

    message.say(embed);
  }
};
