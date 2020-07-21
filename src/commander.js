const messageFormatter = require('./message-formatter');
const Command = require('./command');

module.exports = class Commander {
  constructor(prefix) {
    this.prefix = prefix;
    this.commands = new Map();

    this.addCommand(new Command({
      name: 'help',
      description: 'show this page',
      action: msg => {
        const helpMessage = messageFormatter.getBaseMessage({title: true, description: true})
          .addField('Commands', 'List of available commands:');

        for (const command of new Set(this.commands.values())) {
          helpMessage.addField(`\` ${command.aliases.join('|')}${command.argHelp === '' ? '' : ' ' + command.argHelp} \``, command.description);
        }

        msg.channel.send(helpMessage);
      },
      aliases: ['h']
    }));
  }

  addCommand(command) {
    for (const alias of command.aliases) {
      this.commands.set(alias, command);
    }
  }

  isCommand (command) {
    return command.startsWith(this.prefix) && command.length > this.prefix.length;
  }

  execute(msg) {
    let [commandName, ...commandArgs] = msg.content.slice(this.prefix.length).split(/\s+/);

    if (this.commands.get(commandName)) {
      this.commands.get(commandName).run(msg, ...commandArgs);
    }
    else {
      msg.channel.send(messageFormatter.error(`**${commandName}** isn't a command!`));
    }
  }
}
