const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {stripIndents} = require('common-tags');
const moment = require('moment');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'balance',
      aliases: ['bal', 'money', 'logs', 'account-info', 'transactions'],
      group: 'economy',
      memberName: 'balance',
      description: 'Shows user current balance.',
      args: [
        {
          key: 'user',
          prompt: 'Which user you want to see balance?',
          type: 'user',
          default: msg => msg.author,
        },
      ],
      argsPromptLimit: 1,
    });
  }

  async run(message, {user}) {
    if (user !== message.author && !this.client.owners.includes(message.author)) {
      return message.reply('Only the owners can view the balance of other members.');
    }

    const account = await this.client.getAccount(user);
    let logs = (account.logs || []);
    logs = logs.slice(Math.max(logs.length - 6, 0)).reverse();

    const embed = new MessageEmbed()
      .setAuthor(user.tag, user.displayAvatarURL())
      .setColor(0x03a9f4)
      .setTitle(`${user.tag} account info`)
      .addField('Current balance', `${account.balance} ADV`)
      .addField('Best deal: **30 Coins for 1$!**', 'Buy it now! Use: `+store` or `@GetMembers+#1992 store`')
      .addField('Transactions', logs.length === 0
        ? 'This account does not have any logs yet.'
        : logs.map(log => {
          const balanceDifference = log.balanceAfter - log.balanceBefore;
          return stripIndents`
            **#${log.index} ${moment(log.time).format('DD.MM.YYYY H:mm:ss')}:**
            ${balanceDifference > 0 ? '⬆️ [+' : '⬇️ ['}${balanceDifference}] \`${log.info}\`
            Balance: Before ${log.balanceBefore} | After ${log.balanceAfter}
          `;
        }).join('\n'));

    message.say(embed);
  }
};
