const {Command} = require('discord.js-commando');
const {disambiguation} = require('discord.js-commando').util;
const {stripIndents, oneLine} = require('common-tags');
const {MessageEmbed} = require('discord.js');

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      group: 'util',
      memberName: 'help',
      aliases: ['commands'],
      description: 'Displays a list of available commands, or detailed information for a specified command.',
      details: oneLine`
        The command may be part of a command name or a whole command name.
        If it isn't specified, all available commands will be listed.
      `,
      examples: ['help', 'help prefix'],
      guarded: true,

      args: [
        {
          key: 'command',
          prompt: 'Which command would you like to view the help for?',
          type: 'string',
          default: '',
        },
      ],
    });
  }

  async run(message, {command}) {
    const {groups} = this.client.registry;
    const commands = this.client.registry.findCommands(command, false, message);
    const showAll = command && command.toLowerCase() === 'all';

    const embed = new MessageEmbed()
      .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
      .setTitle('GetMembers+ Help:')
      .setColor('4178c0');

    if (command && !showAll) {
      if (commands.length === 1) {
        const cmd = commands[0];

        let description = stripIndents`
          **Command: ${cmd.name}** ${cmd.nsfw ? '(NSFW)' : ''}
          **Group:** ${cmd.group.name}
          **Description:** ${cmd.description}
          **Usage:** ${cmd.usage(cmd.format)}
        `;
        if (cmd.aliases.length !== 0) {
          description += `\n**Aliases:** ${cmd.aliases.join(', ')}`;
        }
        if (cmd.details !== null) {
          description += `\n**Details:** ${cmd.details}`;
        }
        embed.setDescription(description);
      } else if (commands.length > 15) {
        return message.reply('Multiple commands found. Please be more specific.');
      } else if (commands.length > 1) {
        return message.reply(disambiguation(commands, 'commands'));
      } else {
        return message.reply(
          `Unable to identify command. Use ${message.usage(
            null, message.channel.type === 'dm' ? null : undefined, message.channel.type === 'dm' ? null : undefined,
          )} to view the list of all commands.`,
        );
      }
    } else {
      embed.setDescription('If you need more help please ask for it on our support server: https://discord.gg/y4AFbt5\n\n**`NEW Economy` commands list:**\n`giveaways`: View list of giveaways discord channels.\n`store`: View how to buy coins and official store website link.\n`boost`: View how to get 100 coins by boosting `GetMembers+ [Support]` server.\n\n**`General` commands list:**\n`help`: Displays a list of available commands, or detailed information for a specified command.\n`invite`: Shows bot invite link.\n`prefix`: Shows or sets the command prefix.\n\n**`Economy` commands list:**\n`balance`: Shows user current balance.\n`find`: Join servers to receive ADV coins.\n`buy`: Buy a place in +find for ADV coins.\n`pay`: Transfer ADV coins to another user.\n`use`: Use a gift code.\n`daily`: Get daily coins. only for `GetMembers+ [Support]` server members.\n`current`: View current status of your advertises.\n`check`: View how many time left to no lose coins.\n`store`: Official store of coins + information how to buy coins.');
    }
    message.reply('BUY COINS, 5 DOLLARS => 100 COINS. DO \`+store\`')
    message.embed(embed);
  }
};
