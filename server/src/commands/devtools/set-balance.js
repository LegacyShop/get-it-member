const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'set-balance',
      aliases: ['set', 'set-money'],
      group: 'devtools',
      memberName: 'set-balance',
      description: 'Set user balance.',
      args: [
        {
          key: 'user',
          prompt: 'Which user you want to set balance?',
          type: 'user',
        },
        {
          key: 'balance',
          prompt: 'What balance do you want to set?',
          type: 'integer',
        },
      ],
      argsPromptLimit: 1,
      ownerOnly: true,
    });
  }

  async run(message, {user, balance}) {
    const account = await this.client.getAccount(user);

    const balanceBefore = account.balance;
    account.balance = balance;
    this.client.addLog(account, {
      balanceBefore,
      balanceAfter: account.balance,
      info: `Set balance to ${balance} ADV by ${message.author.tag} (${message.author.id})`,
    });
    await this.client.saveAccount(account);

    const embed = new MessageEmbed()
      .setAuthor(user.tag, user.displayAvatarURL())
      .setTitle(`Successfully set balance to ${balance} ADV`)
      .setThumbnail(user.avatarURL({dynamic: true}))
      .setColor(0x03a9f4)
      .addField('User', user.tag)
      .addField('Current balance', `${account.balance} ADV`);

    message.say(`**Successfully**, \`System\` set to <@${user.id}> - \`${account.balance}\` coins.`);
  }
};
