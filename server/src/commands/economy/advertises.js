const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {stripIndents, oneLine} = require('common-tags');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'current',
      aliases: ['curren', 'curr', 'c', 'status'],
      group: 'economy',
      memberName: 'advertises',
      description: 'View current status of your advertises.',
    });
  }

  async run(message) {
    const advertises = await (new Promise(resolve => {
      this.client.db.advertises.find({
        authorId: message.author.id,
      }, (error, advertises) => resolve(advertises));
    }));

    const embed = new MessageEmbed()
      .setTitle('**Your advertises**')
      .setColor(0x03a9f4)
      .setDescription(stripIndents`
        ${advertises.length === 0 ? 'You haven\'t bought ads yet. Use `+buy`.' : advertises.map(advertise => {
          const guild = this.client.guilds.cache.get(advertise.guildId);
          if (guild) {
            return stripIndents`
            **#${advertise.id} \`${guild.name}\`**
              **Purchased invites:** ${advertise.purchasedInvites}
              **Joined members:** ${advertise.joinedMembers.length}
              ${!advertise.inviteLink
                ? oneLine`
                  **WARNING:** Cannot create an invite link, bot doesn't have enough permissions.
                  Advertise is temporarily disabled. As soon as permissions are granted, the advertisement will be resumed.
                  Ask the guild owner to grant appropriate permissions to the bot.
                ` : ''
              }
            `;
          }
          return '';
        }).join('\n\n')}
      `);

    message.say(embed);
  }
};
