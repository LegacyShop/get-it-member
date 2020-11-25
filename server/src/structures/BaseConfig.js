const {Argument} = require('discord.js-commando');

module.exports = class {
  constructor(provider, subfolder, useGroups, settings) {
    this.provider = provider;
    this.subfolder = subfolder;
    if (useGroups) {
      this.settings = Object.assign({}, ...Object.values(settings));
      this.groups = settings;
    } else {
      this.settings = settings;
    }
  }

  async obtain(message, key, value) {
    const arg = new Argument(message.client, this.settings[key]);
    const result = await arg.obtain(message, value, 1);

    result.displayValue = this.parseDisplayValue(result.value);
    result.value = this.parseValue(result.value);

    return result;
  }

  parseValue(value) {
    const parse = val => (val && val.id ? val.id : val);
    return value instanceof Array ? value.map(parse) : parse(value);
  }

  parseDisplayValue(value, mention = false) {
    const parse = val => {
      if (typeof val === 'string') {
        return val = `\`${val.replace(/`/g, '')}\``;
      }

      if (val && val.name) {
        return mention ? val : val.name;
      }
      return `\`${val}\``;
    };

    let val;
    if (value instanceof Array) {
      val = value.length !== 0 ? value.map(parse).join(', ') : '`[]`';
    } else {
      val = parse(value);
    }

    if (value && !mention && (value.name || value instanceof Array)) {
      return `\`${val}\``;
    }
    return val;
  }

  parse(message, key) {
    const arg = new Argument(message.client, this.settings[key]);
    return arg.parse(`${this.get(key)}`, message);
  }

  get(key, defVal) {
    const setting = this.settings[key];
    defVal = defVal === undefined && setting ? setting.defaultValue : defVal;

    if (this.subfolder) {
      const settings = this.provider.get(this.subfolder, {});
      if (key === null) {
        for (const confSetting of Object.values(this.settings)) {
          if (settings[confSetting.key] === undefined && confSetting.defaultValue !== undefined) {
            settings[confSetting.key] = confSetting.defaultValue;
          }
        }
        return settings;
      }
      return settings[key] !== undefined ? settings[key] : defVal;
    }
    return this.provider.get(key, defVal);
  }

  set(key, value) {
    if (this.subfolder) {
      const settings = this.provider.get(this.subfolder, {});
      settings[key] = value;
      return this.provider.set(this.subfolder, settings);
    }
    return this.provider.set(key, value);
  }

  remove(...keys) {
    if (this.subfolder) {
      const settings = this.provider.get(this.subfolder, {});
      keys.forEach(key => {
        delete settings[key];
        this.provider.set(this.subfolder, settings);
      });
    } else {
      keys.forEach(key => this.provider.remove(key));
    }
  }

  clear() {
    if (this.subfolder) {
      return this.provider.remove(this.subfolder);
    }
    return this.provider.clear();
  }
};
