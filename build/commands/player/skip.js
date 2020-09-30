"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Command } = require("discord.js-commando");
module.exports = class SkipCommand extends Command {
    constructor(client) {
        super(client, {
            name: "skip",
            group: "player",
            memberName: "skip",
            description: "Skips the current track.",
        });
    }
    run(message) {
        const dispatcher = message.guild.audioData
            .trackDispatcher;
        if (dispatcher) {
            dispatcher.end();
        }
    }
};
