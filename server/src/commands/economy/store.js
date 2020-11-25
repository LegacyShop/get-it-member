const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {stripIndents} = require('common-tags');

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'store',
      aliases: ['purchase', 'shop', 's', 'buy-coins'],
      group: 'economy',
      memberName: 'store',
      description: 'There are you can buy coins.',
      details: 'The command will send you link to store website.',
    });
  }

  async run(message) {
    const embed = new MessageEmbed()
      .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
      .setTitle('<a:Coin:761911182172487681> __Official GetMembers+ store of coins.__ <a:Coin:761911182172487681>')
      .setColor('#4178c0')
      .setDescription(stripIndents`
        \`Q: How to buy it?\`
        **1)** Join Discord Server <https://discord.gg/y4AFbt5>.
        Because you are buying role and after this developers check it and paying you coins.
        **2)** Now open official store of coins:
          • If you using paypal: <https://donatebot.io/checkout/741022790366527689>
          • If you using card or bitcoin: <https://www.donationalerts.com/r/coindiscord>
        **3)** Buy coins or supporter role.
        **4)** Wait when developers will pay you.
        **5)** Check your gmail or paypal or something else and accept that coins in your balance.
        __OFFICIAL STORE: <https://donatebot.io/checkout/741022790366527689>__
      `)

    message.say(embed);
  }
};
