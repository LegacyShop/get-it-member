const {stripIndents} = require('common-tags');
const {MessageEmbed} = require('discord.js');
const {Command} = require('discord.js-commando');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'unban',
      group: 'moderation',
      memberName: 'unban',
      description: 'Unban the specified user.',
      args: [
        {
          key: 'user',
          prompt: 'Which user do you want to unban?',
          type: 'user',
        },
        {
          key: 'reason',
          prompt: 'Why do you want unban this user?',
          type: 'string',
          default: 'No reason given.',
          max: 200,
        },
      ],
      argsPromptLimit: 0,
      userPermissions: ['BAN_MEMBERS'],
      clientPermissions: ['BAN_MEMBERS'],
    });
  }

  run(message, {user, reason}) {
    message.guild.members.unban(user, {reason})
      .then(() => {
        const embed = new MessageEmbed()
          .setTitle('Moderation: User unban')
          .setThumbnail(user.displayAvatarURL({dynamic: true}))
          .setColor(0xff0f0f)
          .addField('User', `${user} (${user.id})`)
          .addField('Reason', reason)
          .addField('Unbanned by', `${message.author} (${message.author.id})`)
          .setFooter(message.guild.name)
          .setTimestamp();
        message.say(embed);
      })
      .catch(error => {
        message.reply(stripIndents`
          🚫 Cannot unban this user.
          \`${error}\`
        `);
      });
  }
};
