const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {stripIndents} = require('common-tags');
const Util = require('../../util');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'gifts',
      group: 'devtools',
      memberName: 'gifts',
      description: 'View all created gifts.',
      args: [
        {
          key: 'pageNumber',
          label: 'page number',
          prompt: 'Enter a page number.',
          type: 'integer',
          default: 0,
        },
      ],
      argsPromptLimit: 1,
      ownerOnly: true,
    });
  }

  async run(message, {pageNumber}) {
    const gifts = await (new Promise(resolve => {
      this.client.db.gifts.find({}, (error, gifts) => resolve(gifts));
    }));
    const pageSize = 5;
    const pages = Util.chunks(gifts, pageSize);
    const pageIndex = Math.min(Math.max(pageNumber, 1), Math.ceil(gifts.length / pageSize)) - 1;
    const page = pages[pageIndex];

    const embed = new MessageEmbed()
      .setTitle('🎁 Created gifts')
      .setColor(0x03a9f4)
      .setDescription(page ? page.map(gift => stripIndents`
        \`🎁 Code: ${gift.code}\`
        Reward: ${gift.reward} ADV
        Max uses: ${gift.maxUses}
        Used: ${Object.values(gift.usedMembers).length} time(s)
      `) : 'There are no gifts now. Use `+create-gift` to create one.')
      .setFooter(`Page ${pageIndex + 1}/${pages.length}`);

    message.embed(embed);
  }
};
