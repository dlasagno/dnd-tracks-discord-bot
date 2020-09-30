import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { PlayerProvider } from "../..";

module.exports = class PauseCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "pause",
      group: "player",
      memberName: "pause",
      description: "Pauses the player.",
    });
  }

  async run(message: CommandoMessage): Promise<Message> {
    const dispatcher = ((message.guild as unknown) as PlayerProvider).audioData
      .trackDispatcher;
    if (dispatcher) dispatcher.pause();

    return message.message;
  }
};
