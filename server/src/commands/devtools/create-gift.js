const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const Util = require('../../util');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'create-gift',
      aliases: ['create-code', 'code-create'],
      group: 'devtools',
      memberName: 'create-gift',
      description: 'Create a gift.',
      args: [
        {
          key: 'reward',
          prompt: 'Enter the gift reward.',
          type: 'float',
        },
        {
          key: 'maxUses',
          prompt: 'Enter how many users can use this gift.',
          type: 'integer',
          default: 1,
          min: 1,
        },
        {
          key: 'code',
          prompt: 'Enter the gift code (for example, 1122-3344-9988).',
          type: 'string',
          min: 3,
          default: () => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let code = '';
            for (let i = 0; i < 10; i++) {
              code += Util.randomChoice(characters);
            }
            return `GETMEMBERS-${code}`;
          },
        },
      ],
      argsPromptLimit: 2,
      ownerOnly: true,
    });
  }

  async run(message, {code, reward, maxUses}) {
    const existingGift = await (new Promise(resolve => {
      this.client.db.gifts.findOne({
        code,
      }, (error, gift) => resolve(gift));
    }))

    if (existingGift) {
      return message.reply('Gift with this code already exists 🚫');
    }

    const gift = {
      authorId: message.author.id,
      code,
      reward,
      maxUses,
      usedMembers: {},
    };

    this.client.db.gifts.insert(gift);

    const embed = new MessageEmbed()
      .setTitle('🎁 Gift successfully created')
      .setColor(0x03a9f4)
      .setDescription(`
        \`${code}\`
        **Reward:** ${gift.reward} ADV
        **Max uses:** ${gift.maxUses}
      `);

    message.say(`**Successfully**, \`System\` created gift code - \`${gift.reward}\``);
  }
};
