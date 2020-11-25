const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'pay',
      aliases: ['give'],
      group: 'economy',
      memberName: 'pay',
      description: 'Transfer ADV coins to another user.',
      args: [
        {
          key: 'user',
          prompt: 'Which user do you want to pay?',
          type: 'user',
        },
        {
          key: 'count',
          prompt: 'How many ADV coins do you want to pay?',
          type: 'float',
          min: 0,
        },
      ],
      argsPromptLimit: 1,
    });
  }

  async run(message, {user, count}) {
    const fromAccount = await this.client.getAccount(message.author);
    const toAccount = await this.client.getAccount(user);
    const minimumPayout = this.client.config.get('minimumPayout');

    if (fromAccount.balance < count) {
      return message.reply('You don\'t have enough ADV coins to transfer.');
    }
    if (fromAccount.id === toAccount.id) {
      return message.reply('You cannot pay to yourself.');
    }
    if (count < minimumPayout) {
      return message.reply(`Minimum payout is \`${minimumPayout}\` ADV.`);
    }

    fromAccount.balance -= count;
    toAccount.balance += count;
    this.client.addLog(fromAccount, {
      balanceBefore: fromAccount.balance + count,
      balanceAfter: fromAccount.balance,
      info: `Transferred ${count} ADV to ${user.tag} (${user.id})`,
    });
    this.client.addLog(toAccount, {
      balanceBefore: toAccount.balance - count,
      balanceAfter: toAccount.balance,
      info: `Transferred ${count} ADV from ${message.author.tag} (${message.author.id})`,
    });
    await this.client.saveAccount(fromAccount);
    await this.client.saveAccount(toAccount);

    const embed = new MessageEmbed()
      .setAuthor(user.tag, user.displayAvatarURL())
      .setTitle(`Successfully transfered ${count} ADV coins`)
      .setThumbnail(user.avatarURL({dynamic: true}))
      .setColor(0x03a9f4)
      .addField('Transferred from', message.author.tag)
      .addField('Transferred to', user.tag)
      .addField('Your current balance', `${fromAccount.balance} ADV`)
      .addField('Recipient current balance', `${toAccount.balance} ADV`);

    message.say(`**Successfully**, <@${message.author.id}> paid to <@${user.id}> - \`${count}\` coins. `);
  }
};
