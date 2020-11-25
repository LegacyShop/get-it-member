const {stripIndents} = require('common-tags');
const {MessageEmbed} = require('discord.js');
const {Command} = require('discord.js-commando');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      group: 'moderation',
      memberName: 'kick',
      description: 'Kick the specified member.',
      args: [
        {
          key: 'member',
          prompt: 'Which member do you want to kick?',
          type: 'member',
        },
        {
          key: 'reason',
          prompt: 'Why do you want kick this member?',
          type: 'string',
          default: 'No reason given.',
          max: 200,
        },
      ],
      argsPromptLimit: 0,
      userPermissions: ['KICK_MEMBERS'],
      clientPermissions: ['KICK_MEMBERS'],
    });
  }

  run(message, {member, reason}) {
    member.kick(reason)
      .then(() => {
        const embed = new MessageEmbed()
          .setTitle('Moderation: Member kick')
          .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
          .setColor(0xff0f0f)
          .addField('Member', `${member} (${member.id})`)
          .addField('Reason', reason)
          .addField('Kicked by', `${message.author} (${message.author.id})`)
          .setFooter(message.guild.name)
          .setTimestamp();
        message.say(embed);
      })
      .catch(error => {
        message.reply(stripIndents`
          🚫 Cannot kick this member.
          \`${error}\`
        `);
      });
  }
};
