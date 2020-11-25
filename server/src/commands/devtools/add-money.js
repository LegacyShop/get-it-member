const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'add-money',
      aliases: ['add'],
      group: 'devtools',
      memberName: 'add-money',
      description: 'Add money to user.',
      args: [
        {
          key: 'user',
          prompt: 'To which user you want to add ADV coins?',
          type: 'user',
        },
        {
          key: 'count',
          prompt: 'How much ADV coins do you want to add?',
          type: 'float',
          min: 0.01,
        },
      ],
      argsPromptLimit: 1,
      ownerOnly: true,
    });
  }

  async run(message, {user, count}) {
    const toAccount = await this.client.getAccount(user);

    const balanceBefore = toAccount.balance;
    toAccount.balance += count;
    this.client.addLog(toAccount, {
      balanceBefore,
      balanceAfter: toAccount.balance,
      info: `Added ${count} ADV by ${message.author.tag} (${message.author.id})`,
    });
    await this.client.saveAccount(toAccount);

    const embed = new MessageEmbed()
      .setAuthor(user.tag, user.displayAvatarURL())
      .setTitle(`Successfully added ${count} ADV`)
      .setThumbnail(user.avatarURL({dynamic: true}))
      .setColor(0x03a9f4)
      .addField('Added to', user.tag)
      .addField('Recipient current balance', `${toAccount.balance} ADV`);

    message.say(`**Successfully**, \`System\` added to <@${user.id}> - \`${count}\` coins.`);
  }
};
