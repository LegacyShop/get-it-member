const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'buy',
      group: 'economy',
      memberName: 'buy',
      description: 'Buy a place in +find for ADV coins.',
      args: [
        {
          key: 'invitesCount',
          prompt: 'How many invites do you want to buy?',
          type: 'integer',
          min: 1,
          max: 2000,
        },
        {
          key: 'description',
          prompt: 'Provide a description for you sever.',
          type: 'string',
          default: 'Join this server to get ADV coins.',
          max: 100,
        },
      ],
      argsPromptLimit: 0,
      guildOnly: true,
      clientPermissions: ['ADMINISTRATOR'],
    });
  }

  async run(message, {invitesCount, description}) {
    const {guild} = message;
    const config = this.client.getConfig();
    let advertise = await (new Promise(resolve => {
      this.client.db.advertises.findOne({
        guildId: guild.id,
        authorId: message.author.id,
      }, (error, advertise) => resolve(advertise));
    }));
    const lastAdvertise = await (new Promise(resolve => {
      this.client.db.advertises.find().sort({id: -1}).limit(1, (error, advertises) => {
        resolve(advertises[0]);
      });
    }));
    const account = await this.client.getAccount(message.author);
    const cost = invitesCount * config.inviteCost;

    if (account.balance < cost) {
      return message.reply(`You don't have enough ADV to buy ${invitesCount} invitesCount (${cost} ADV).`);
    }


    const invites = await guild.fetchInvites()
      .catch(err => console.error(`Unable to fetch invites (guild ${guild.id}): ${err}`));
    if (!invites) {
      return message.reply('Something went wrong: unable to fetch guild invites. Grant the bot permissions.');
    }
    this.client.guildCachedInvites[guild.id] = [...invites.values()];

    if (advertise) {
      advertise.purchasedInvites += invitesCount;
      this.client.db.advertises.save(advertise);
    } else {
      advertise = {
        id: lastAdvertise ? lastAdvertise.id + 1 : 1,
        guildId: guild.id,
        authorId: message.author.id,
        purchasedInvites: invitesCount,
        joinReward: config.joinServerReward,
        joinedMembers: [],
        description,
        inviteLink: await message.channel.createInvite({
          maxAge: 0,
          unique: true,
          reason: `${message.author.tag} bought advertise`,
        }),
      };
      advertise.inviteLink = advertise.inviteLink.toString();
      this.client.db.advertises.insert(advertise);
    }

    const balanceBefore = account.balance;
    account.balance -= cost;
    this.client.addLog(account, {
      balanceBefore,
      balanceAfter: account.balance,
      info: `Bought ${invitesCount} invite(s) for ${guild.name} server`,
    });
    this.client.saveAccount(account);

    const embed = new MessageEmbed()
      .setTitle('Successfully bought an advertise')
      .setColor(0x03a9f4)
      .setDescription(`
        **${invitesCount} invites for ${cost} ADV**
        **Server:** ${guild.name}
        **Description:** ${description}
        **Invite:** ${advertise.inviteLink}
        **Residual balance:** ${account.balance} ADV
      `);

    message.say(embed);
  }
};
