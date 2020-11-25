const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {stripIndents} = require('common-tags');

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'boost',
      aliases: ['bs'],
      group: 'economy', 
      memberName: 'boosts',
      description: 'There are you can join on GetMembers+ server and get 100 coins per week by boost.',
      details: 'The command will send you link to discord boost channel.',
    });
  }

  async run(message) {
    const embed = new MessageEmbed()
      .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
      .setTitle('GetMembers+ Boost rewards')
      .setColor('#f47fff')
      .setDescription(stripIndents`
        By boosting __https://discord.gg/R58mrAK__ you will get 100 coins.
        You can get up to 100 coins per week(7days).
      `);

    message.say(embed);
  }
};
