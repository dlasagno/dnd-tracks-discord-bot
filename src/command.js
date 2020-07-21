module.exports = class Command {
  constructor({
    name,
    description,
    action,
    argHelp = '',
    aliases = []
  }) {
    this.name = name;
    this.description = description;
    this.action = action;
    this.argHelp = argHelp;
    this._aliases = aliases;
  }

  get aliases() {
    return [this.name].concat(this._aliases);
  }

  run(...args) {
    this.action(...args);
  }
}
