require("dotenv").config();
const { CommandoClient } = require("discord.js-commando");
const { Structures } = require("discord.js");
const chalk = require("chalk");
const path = require("path");

Structures.extend(
  "Guild",
  (Guild) =>
    class AudioGuild extends Guild {
      constructor(client, data) {
        super(client, data);
        this.audioData = {
          queue: [],
          trackDispatcher: null,
        };
      }
    }
);

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
  console.log(`Logged in as ${chalk.magenta(client.user.tag)}!`);

  client.user.setActivity("d.help", { type: "LISTENING" });
});

client.on("commandRun", ({ message }) => {
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
