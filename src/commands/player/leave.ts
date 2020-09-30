import { CommandoClient, CommandoMessage } from "discord.js-commando";
import {} from "discord.js";
import { PlayerProvider } from "../..";

const { Command } = require("discord.js-commando");

module.exports = class LeaveCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "leave",
      aliases: ["l"],
      group: "player",
      memberName: "leave",
      description: "Leave the voice channel.",
    });
  }

  async run(message: CommandoMessage) {
    const playerProvider = (message.guild as unknown) as PlayerProvider;
    const dispatcher = playerProvider.audioData.trackDispatcher;
    if (dispatcher) {
      (dispatcher.player as any).voiceConnection.disconnect();
      playerProvider.audioData = {
        ...playerProvider.audioData,
        queue: [],
        trackDispatcher: null,
      };
    }
  }
};
