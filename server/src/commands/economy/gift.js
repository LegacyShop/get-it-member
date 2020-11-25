const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'gift',
      aliases: ['code', 'use'],
      group: 'economy',
      memberName: 'gift',
      description: 'Use a gift.',
      args: [
        {
          key: 'code',
          prompt: 'Enter the gift code (for example, 1122-3344-9988).',
          type: 'string',
        },
      ],
      argsPromptLimit: 0,
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
    if (gift.usedMembers[message.author.id]) {
      return message.reply('🎁 You have already used this gift 🚫');
    }
    
    message.delete().catch(() => null);
    gift.usedMembers[message.author.id] = true;
  
    if (Object.values(gift.usedMembers).length >= gift.maxUses) {
      this.client.db.gifts.remove({
        _id: this.client.db.ObjectId(gift._id),
      });
    } else {
      this.client.db.gifts.save(gift);
    }

    const giftAuthor = this.client.users.cache.get(gift.authorId);
    const account = await this.client.getAccount(message.author);
    const balanceBefore = account.balance;
    account.balance += gift.reward;
    this.client.addLog(account, {
      balanceBefore,
      balanceAfter: account.balance,
      info: `Used a gift ${code} created by ${giftAuthor ? giftAuthor.tag : ''} (${gift.authorId})`,
    });

    this.client.saveAccount(account);

    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setThumbnail(message.author.avatarURL({dynamic: true}))
      .setTitle(`🎁 You received ${gift.reward} ADV from the gift!`)
      .setColor(0x03a9f4)
      .setDescription(`
        Current balance: ${account.balance} ADV
      `);

    message.say(`**Successfully**, ${message.author} used a gift code - \`${gift.reward}\` reward coin(s).`);
  }
};
