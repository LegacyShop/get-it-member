const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {stripIndents, oneLine} = require('common-tags');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'config',
      aliases: ['conf', 'settings', 'bot-settings'],
      group: 'devtools',
      memberName: 'config',
      description: 'View or change bot config.',
      details: oneLine`
        If the key is not provided, the current bot configuration will be shown.
        If the value is "default", the value will be reset to the default value.
        Only bot owners may change the guild configuration.
      `,
      args: [
        {
          key: 'key',
          prompt: 'What value do you want to change?',
          type: 'string',
          default: '',
          validate: (val, msg) => {
            if (msg.client.config.settings[val]) {
              return true;
            }
            return 'This key doesn\'t exist. Use `config` to see the available settings.';
          },
        },
        {
          key: 'value',
          prompt: 'What will be the value?',
          type: 'string',
          max: 200,
          default: '',
        },
      ],
      argsPromptLimit: 1,
      ownerOnly: true,
    });
  }

  async run(message, {key, value}) {
    if (key) {
      if (value === 'default') {
        this.client.config.remove(key);
        return message.say(`The value of \`${key}\` has been reset to default.`);
      }

      const result = await this.client.config.obtain(message, key, value);

      if (result.value === null) {
        return message.reply('Cancelled command.');
      }

      await this.client.config.set(key, result.value);
      message.say(`The value of \`${key}\` has been changed to ${result.displayValue}.`);
    } else {
      /* eslint-disable indent */
      const embed = new MessageEmbed()
        .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
        .setColor(0xe1fc2d)
        .setTitle('Bot Configuration')
        .setDescription(stripIndents`
          Use \`config <key> <value>\` to edit the config value.
          Use \`config <key> default\` to reset the config value.

          ${Object.values(this.client.config.settings).map(setting => {
            const val = this.client.config.parse(message, setting.key);
            const displayValue = this.client.config.parseDisplayValue(val, true);

            return stripIndents`
              **${setting.key}:** ${displayValue}
              ${setting.description}
            `;
          }).join('\n\n')}
        `);

      message.say(embed);
    }
  }
};
