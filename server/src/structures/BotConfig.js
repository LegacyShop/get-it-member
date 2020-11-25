const BaseConfig = require('./BaseConfig');
const config = require('../../../config.json');

module.exports = class extends BaseConfig {
  constructor(client) {
    super(client.settings, 'config', false, {
      invite: {
        key: 'invite',
        prompt: 'Specify an invite for the official server.',
        type: 'string',
        defaultValue: config.invite,
        description: 'Invite for the official server.',
      },
      officialServer: {
        key: 'officialServer',
        prompt: 'Enter the official server ID.',
        type: 'string',
        defaultValue: config.officialServer,
        description: 'Official server ID.',
      },
      supportServer: {
        key: 'supportServer',
        prompt: 'Enter the support server ID.',
        type: 'string',
        defaultValue: config.supportServer,
        description: 'Support server ID.',
      },
      inviteLogChannel: {
        key: 'inviteLogChannel',
        prompt: 'Enter invite log channel.',
        type: 'channel',
        defaultValue: config.inviteLogChannel,
        description: 'Channel for the bot invite log.',
      },

      displayedServersCount: {
        key: 'displayedServersCount',
        prompt: 'Enter count of displayed servers in `+find` (number).',
        type: 'integer',
        defaultValue: config.displayedServersCount,
        description: 'Number of displayed  servers in find.',
      },
      inviteCost: {
        key: 'inviteCost',
        prompt: 'Enter const of 1 invite (number).',
        type: 'float',
        defaultValue: config.inviteCost,
        description: 'Cost of 1 invite in +buy.',
      },
      userStartBalance: {
        key: 'userStartBalance',
        prompt: 'Enter user start balance (number).',
        type: 'float',
        defaultValue: config.userStartBalance,
        description: 'Start balance for new users.',
      },
      minimumPayout: {
        key: 'minimumPayout',
        prompt: 'Enter minimum payout (number).',
        type: 'float',
        defaultValue: config.minimumPayout,
        description: 'Minimum payout for +pay command.',
      },
      dailyReward: {
        key: 'dailyReward',
        prompt: 'Enter the daily reward (number).',
        type: 'float',
        defaultValue: config.dailyReward,
        description: 'Daily reward for +daily command.',
      },
      weeklyReward: {
        key: 'weeklyReward',
        prompt: 'Enter the weekly reward (number).',
        type: 'float',
        defaultValue: config.weeklyReward,
        description: 'Weekly reward for +weekly command.',
      },
      joinServerReward: {
        key: 'joinServerReward',
        prompt: 'Enter the reward for joining a server from +find.',
        type: 'float',
        defaultValue: config.joinServerReward,
        description: 'Reward for joining a server from +find.',
      },
      joinServerRewardMultiplier: {
        key: 'joinServerRewardMultiplier',
        prompt: 'Enter join reward multiplier (number).',
        type: 'float',
        defaultValue: config.joinServerRewardMultiplier,
        description: 'Join reward multiplier for members joined the official server.',
      },
      serverBoostingReward: {
        key: 'serverBoostingReward',
        prompt: 'Enter reward for server boosting (number).',
        type: 'float',
        defaultValue: config.serverBoostingReward,
        description: 'Reward for official server boosters.',
      },
      hoursBeforeLeavingServer: {
        key: 'hoursBeforeLeavingServer',
        prompt: 'Enter how many hours member should be on the server before leaving (number).',
        type: 'integer',
        defaultValue: config.hoursBeforeLeavingServer,
        description: 'How many hours should member be on the server before leaving.',
      },
      leavingPenaltyPercentage: {
        key: 'leavingPenaltyPercentage',
        prompt: 'Enter penalty percentage (number).',
        type: 'float',
        defaultValue: config.leavingPenaltyPercentage,
        description: 'Penalty percentage of the reward for leaving the server before advertise in +find ended.',
      },
    });
  }
};
