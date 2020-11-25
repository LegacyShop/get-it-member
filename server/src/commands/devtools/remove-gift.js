const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-gift',
      aliases: ['remove-code', 'code-remove'],
      group: 'devtools',
      memberName: 'remove-gift',
      description: 'Remove a gift.',
      args: [
        {
          key: 'code',
          prompt: 'Enter the gift code (for example, 1122-3344-9988).',
          type: 'string',
        },
      ],
      argsPromptLimit: 2,
      ownerOnly: true,
    });
  }

  async run(message, {code}) {
    const gift = await (new Promise(resolve => {
      this.client.db.gifts.findOne({
        code,
      }, (error, gift) => resolve(gift));
    }));

    if (!gift) {
      return message.reply('🎁 Gift with this code doesn\'t exists 🚫');
    }

    this.client.db.gifts.remove({
      _id: this.client.db.ObjectId(gift._id),
    });

    const embed = new MessageEmbed()
      .setTitle('🎁 Gift successfully removed')
      .setColor('4178c0')
      .setDescription(`
        \`${code}\`
        **Reward:** ${gift.reward} ADV
        **Max uses:** ${gift.maxUses}
        **Used:** ${Object.values(gift.usedMembers).length} time(s)
      `);

    message.say('**Successfully**, `System` removed gift code.');
  }
};
