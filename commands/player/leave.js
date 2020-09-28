const { Command } = require("discord.js-commando");

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: "leave",
      aliases: ["l"],
      group: "player",
      memberName: "leave",
      description: "Leave the voice channel.",
    });
  }

  async run(message) {
    const dispatcher = message.guild.audioData.trackDispatcher;
    if (dispatcher) {
      dispatcher.player.voiceConnection.disconnect();
      message.guild.audioData = {
        ...message.guild.audioData,
        queue: [],
        trackDispatcher: null,
      };
    }
  }
};
