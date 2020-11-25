const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-coins',
      aliases: ['remove'],
      group: 'devtools',
      memberName: 'remove-money',
      description: 'Remove money from user.',
      args: [
        {
          key: 'user',
          prompt: 'From which user you want to remove ADV coins?',
          type: 'user',
        },
        {
          key: 'count',
          prompt: 'How much ADV coins do you want to remove?',
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
    toAccount.balance -= count;
    this.client.addLog(toAccount, {
      balanceBefore,
      balanceAfter: toAccount.balance,
      info: `Removed ${count} ADV by ${message.author.tag} (${message.author.id})`,
    });
    await this.client.saveAccount(toAccount);

    const embed = new MessageEmbed()
      .setAuthor(user.tag, user.displayAvatarURL())
      .setTitle(`Successfully removed ${count} ADV`)
      .setThumbnail(user.avatarURL({dynamic: true}))
      .setColor(0x03a9f4)
      .addField('Removed from', user.tag)
      .addField('Recipient current balance', `${toAccount.balance} ADV`);

    message.say(`**Successfully**, \`System\` removed from <@${user.id}> - \`${count}\` coins.`);
  }
};
