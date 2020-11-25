const {stripIndents} = require('common-tags');
const {util} = require('discord.js-commando');

module.exports = class Util {
  static get permissions() {
    return util.permissions;
  }

  static userMention(id) {
    return `<@${id}>`;
  }

  static random(min, max) {
    return min + (Math.random() * (max - min));
  }

  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static randomItems(array, count) {
    return array.slice().sort(() => 0.5 - Math.random()).slice(0, count);
  }

  static resolveString(string = '', maxLength = 2000) {
    if (string.length > maxLength) {
      return `${string.slice(0, maxLength)}...`;
    }
    return string;
  }

  static resolveArray(array = [], maxLength = 100) {
    if (array.length === 0) {
      return 'None';
    }
    if (array.length > maxLength) {
      return stripIndents`
        ${array.slice(0, maxLength).join(' ')}
        **and ${array.length - maxLength} more..**
      `;
    }
    return array.join(' ');
  }

  static chunks(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, chunkSize + i));
    }
    return result;
  }

  static sortRoles(guild, roles) {
    return roles.array()
      .filter(role => role !== guild.roles.everyone)
      .sort((a, b) => b.position - a.position);
  }

  static sortByJoinedTimestamp(collection) {
    return collection.array()
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
  }

  static addOrdinal(number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = number % 100;
    return number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  }

  static getTextChannels(guild) {
    return guild.channels.cache.array()
      .filter(channel => channel.type === 'text')
      .sort((a, b) => a.position - b.position);
  }

  static getJoinPosition(guild, member) {
    return guild.members.cache.array()
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
      .indexOf(member) + 1;
  }
};
