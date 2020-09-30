import { CommandoClient, CommandoMessage } from "discord.js-commando";
import { PlayerProvider } from "../..";

const { Command } = require("discord.js-commando");

module.exports = class SkipCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "skip",
      group: "player",
      memberName: "skip",
      description: "Skips the current track.",
    });
  }

  run(message: CommandoMessage) {
    const dispatcher = ((message.guild as unknown) as PlayerProvider).audioData
      .trackDispatcher;
    if (dispatcher) {
      dispatcher.end();
    }
  }
};
