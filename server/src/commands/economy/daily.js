const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {stripIndents} = require('common-tags');
const moment = require('moment');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'daily',
      group: 'economy',
      memberName: 'daily',
      description: 'Get daily ADV coins.',
    });
  }

  async run(message) {
    const config = this.client.getConfig();
    const account = await this.client.getAccount(message.author);

    if (message.guild.id != config.officialServer) {
      return message.reply(stripIndents`
        You can use \`+daily\` only on the \`GetMembers+ Official\`.
        ${this.client.options.invite}
      `);
    }

    const currentDate = new Date();
    const timeDifference = currentDate - account.lastReceivedDaily;
    // 24h * 60m * 60s * 1000ms
    const dayInMilliseconds = 24 * 60 * 60 * 1000;

    if (timeDifference < dayInMilliseconds) {
      return message.reply(stripIndents`
        You already received a daily reward.
        You can use \`+daily\` again in \`${moment(account.lastReceivedDaily + dayInMilliseconds).fromNow(true)}\`.
      `);
    }

    const balanceBefore = account.balance;
    account.balance += config.dailyReward;
    account.lastReceivedDaily = currentDate.getTime();
    this.client.addLog(account, {
      balanceBefore,
      balanceAfter: account.balance,
      info: 'Received daily reward',
    });
    this.client.saveAccount(account);

    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setThumbnail(message.author.avatarURL({dynamic: true}))
      .setTitle(`You received daily ${config.dailyReward} ADV coins!`)
      .setColor(0x03a9f4)
      .setDescription(`
        Current balance: ${account.balance} ADV
      `);

    message.say(embed);
  }
};
