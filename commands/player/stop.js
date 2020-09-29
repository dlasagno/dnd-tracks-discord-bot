const { Command } = require("discord.js-commando");

module.exports = class StopCommand extends Command {
  constructor(client) {
    super(client, {
      name: "stop",
      group: "player",
      memberName: "stop",
      description: "Stops the player, emptying its queue.",
    });
  }

  run(message) {
    const dispatcher = message.guild.audioData.trackDispatcher;
    if (dispatcher) {
      message.guild.audioData.queue.length = 0;
      dispatcher.end();
    }
  }
};
