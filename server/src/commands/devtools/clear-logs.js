const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'clear-logs',
      aliases: ['reset-logs'],
      group: 'devtools',
      memberName: 'clear-logs',
      description: 'Clear user logs.',
      args: [
        {
          key: 'user',
          prompt: 'Which user you want to clear logs?',
          type: 'user',
        },
      ],
      argsPromptLimit: 1,
      ownerOnly: true,
    });
  }

  async run(message, {user, balance}) {
    const account = await this.client.getAccount(user);
    account.logs = [];
    await this.client.saveAccount(account);
    message.say(`Successfully cleared \`${user.tag}\`'s logs.`);
  }
};
