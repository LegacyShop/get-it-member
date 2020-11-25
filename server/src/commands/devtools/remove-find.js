const {Command} = require('discord.js-commando');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-find',
      aliases: ['remove-advertise'],
      group: 'devtools',
      memberName: 'remove-find',
      description: 'Remove an advertise from +find.',
      args: [
        {
          key: 'findId',
          prompt: 'Specify a find identificator.',
          type: 'integer',
        },
      ],
      argsPromptLimit: 0,
      ownerOnly: true,
      clientPermissions: ['ADMINISTRATOR'],
    });
  }

  async run(message, {findId}) {
    this.client.db.advertises.findOne({
      id: findId,
    }, async (error, advertise) => {
      if (!advertise) {
        return message.reply(`Couldn't find an advertise with \`${findId}\` identificator.`);
      }

      // Remove the invite link.
      const guild = this.client.guilds.cache.get(advertise.guildId);
      if (guild) {
        const invites = await guild.fetchInvites().catch(() => null);
        if (invites) {
          for (const inv of invites) {
            if (inv.toString() === advertise.inviteLink) {
              inv.delete();
            }
          }
        }
      }

      this.client.db.advertises.remove({
        _id: this.client.db.ObjectId(advertise._id),
      });
      message.reply(`**Successfuly**, \`System\` removed advertise with id \`${findId}\` from \`find\`.`);
    });
  }
};
