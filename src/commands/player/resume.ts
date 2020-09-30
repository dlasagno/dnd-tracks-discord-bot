import { CommandoClient, CommandoMessage } from "discord.js-commando";
import { PlayerProvider } from "../..";

const { Command } = require("discord.js-commando");

module.exports = class ResumeCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "resume",
      group: "player",
      memberName: "resume",
      description: "Resumes the player.",
    });
  }

  run(message: CommandoMessage) {
    const dispatcher = ((message.guild as unknown) as PlayerProvider).audioData
      .trackDispatcher;
    if (dispatcher) dispatcher.resume();
  }
};
