require("dotenv").config();
const { CommandoClient } = require("discord.js-commando");
const ytdl = require("ytdl-core");
const chalk = require("chalk");
const path = require("path");

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

client.on("error", console.error);

client.login(process.env.DISCORD_TOKEN);
