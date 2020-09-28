const { Command } = require("discord.js-commando");

module.exports = class PauseCommand extends Command {
  constructor(client) {
    super(client, {
      name: "pause",
      group: "player",
      memberName: "pause",
      description: "Pauses the player.",
    });
  }

  run(message) {
    const dispatcher = message.guild.audioData.trackDispatcher;
    if (dispatcher) dispatcher.pause();
  }
};
