require("dotenv").config();
import { Client, CommandoClient } from "discord.js-commando";
import { StreamDispatcher, Structures } from "discord.js";
import chalk from "chalk";
import path from "path";

export interface PlayerData {
  queue: Array<[index: number, url: string]>;
  trackDispatcher: StreamDispatcher | null;
}

export interface PlayerProvider {
  audioData: PlayerData;
}

Structures.extend("Guild", (Guild) => {
  class AudioGuild extends Guild implements PlayerProvider {
    audioData: PlayerData;

    constructor(client: Client, data: object) {
      super(client, data);
      this.audioData = {
        queue: [],
        trackDispatcher: null,
      };
    }
  }

  return AudioGuild;
});

const client = new CommandoClient({
  commandPrefix: "d.",
  owner: "224526254974566401",
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ["player", "Player"],
    ["list", "List management"],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, "commands"));

client.once("ready", () => {
  console.log(`Logged in as ${chalk.magenta(client.user?.tag)}!`);

  client.user?.setActivity("d.help", { type: "LISTENING" });
});

client.on("commandRun", (_command, _promise, message) => {
  if (!message) return;

  console.log();
  console.log(
    `${chalk.cyan(
      new Date().toLocaleTimeString()
    )} - Received command from ${chalk.magenta(message.author.tag)}: ${
      message.content
    }`
  );
});

client.on("error", console.error);

client.login(process.env.DISCORD_TOKEN);
