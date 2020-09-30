"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const discord_js_commando_1 = require("discord.js-commando");
const discord_js_1 = require("discord.js");
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
discord_js_1.Structures.extend("Guild", (Guild) => class AudioGuild extends Guild {
    constructor(client, data) {
        super(client, data);
        this.audioData = {
            queue: [],
            trackDispatcher: null,
        };
    }
});
const client = new discord_js_commando_1.CommandoClient({
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
    .registerCommandsIn(path_1.default.join(__dirname, "commands"));
client.once("ready", () => {
    console.log(`Logged in as ${chalk_1.default.magenta(client.user.tag)}!`);
    client.user.setActivity("d.help", { type: "LISTENING" });
});
client.on("commandRun", ({ message }) => {
    if (!message)
        return;
    console.log();
    console.log(`${chalk_1.default.cyan(new Date().toLocaleTimeString())} - Received command from ${chalk_1.default.magenta(message.author.tag)}: ${message.content}`);
});
client.on("error", console.error);
client.login(process.env.DISCORD_TOKEN);
