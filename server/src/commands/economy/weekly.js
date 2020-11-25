const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {stripIndents} = require('common-tags');
const moment = require('moment');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'weekly',
      group: 'economy',
      memberName: 'weekly',
      description: 'Get weekly ADV coins.',
    });
  }

  async run(message) {
    const config = this.client.getConfig();
    const account = await this.client.getAccount(message.author);

    if (message.guild.id != config.officialServer) {
      return message.reply(stripIndents`
        You can use \`+weekly\` only on the \`GetMembers+ Official\`.
        ${this.client.options.invite}
      `);
    }

    const currentDate = new Date();
    const timeDifference = currentDate - account.lastReceivedWeekly;
    // 7d * 24h * 60m * 60s * 1000ms
    const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

    if (timeDifference < weekInMilliseconds) {
      return message.reply(stripIndents`
        You already received a weekly reward.
        You can use \`+weekly\` again in \`${moment(account.lastReceivedWeekly + weekInMilliseconds).fromNow(true)}\`.
      `);
    }

    const balanceBefore = account.balance;
    account.balance += config.weeklyReward;
    account.lastReceivedWeekly = currentDate.getTime();
    this.client.addLog(account, {
      balanceBefore,
      balanceAfter: account.balance,
      info: 'Received weekly reward',
    });
    this.client.saveAccount(account);

    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setThumbnail(message.author.avatarURL({dynamic: true}))
      .setTitle(`You received weekly ${config.weeklyReward} ADV coins!`)
      .setColor(0x03a9f4)
      .setDescription(`
        Current balance: ${account.balance} ADV
      `);

    message.say(embed);
  }
};
