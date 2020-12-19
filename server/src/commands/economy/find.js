const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {stripIndents} = require('common-tags');
const Util = require('../../util');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'find',
      aliases: ['f', 'servers'],
      group: 'economy',
      memberName: 'find',
      description: 'Join servers to receive ADV coins.',
    });
  }

  async run(message) {
    const config = this.client.getConfig();
    const advertises = await this.client.getAdvertises();
    const recommendedAdvertises = advertises.filter(advertise => {
      const guild = this.client.guilds.cache.get(advertise.guildId);
      return guild && !guild.member(message.author);
    });

    const embed = new MessageEmbed()
      .setTitle('**__Server Finder__**')
      .setColor(0x03a9f4)
      .setThumbnail('https://media.discordapp.net/attachments/765591525567758406/767096936082964510/unknown.png')
      .setDescription(stripIndents`
        Hey ${message.author}, join these servers to get ADV coins.
        *To buy an advertise here type \`+buy\` (each invite costs 1 ADV coin)*
        *Note: If you leave from the server, the reward will not be counted.*
        *If you wanna get coins without by joining on servers do \`+purchase\`*

        ${recommendedAdvertises.length === 0 ? 'You have joined all servers! Wait some time!'
          : Util.randomItems(recommendedAdvertises, config.displayedServersCount).map(advertise => {
            const guild = this.client.guilds.cache.get(advertise.guildId);
            return stripIndents`
              ID: #${advertise.id} \`${advertise.description || 'Join this server to get ADV coins.'}\`
              **${guild.name}** - ${advertise.inviteLink}
              **Reward:** ${advertise.joinReward} coins
            `;
          }).join('\n\n')}
          \nOfficial bot tutorial video like and sub and comment <https://www.youtube.com/watch?v=aLMGoa3xzNs>
        \n__**\`Dont wanna waste time? You wanna get more coins? Just join on this server and get up to x1.35 coins or buy coins in official store +store\`**__
        **GetMembers+ [Support]:** ${this.client.options.invite}
      `);
    message.reply('BUY COINS, 5 DOLLARS => 100 COINS. DO \`+store\`')
    message.say(embed);
  }
};
