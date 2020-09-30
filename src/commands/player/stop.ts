import { CommandoClient, CommandoMessage } from "discord.js-commando";
import { PlayerProvider } from "../..";

const { Command } = require("discord.js-commando");

module.exports = class StopCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "stop",
      group: "player",
      memberName: "stop",
      description: "Stops the player, emptying its queue.",
    });
  }

  run(message: CommandoMessage) {
    const playerProvider = (message.guild as unknown) as PlayerProvider;
    const dispatcher = playerProvider.audioData.trackDispatcher;
    if (dispatcher) {
      playerProvider.audioData.queue.length = 0;
      dispatcher.end();
    }
  }
};
