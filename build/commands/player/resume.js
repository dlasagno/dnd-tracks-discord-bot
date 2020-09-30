"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Command } = require("discord.js-commando");
module.exports = class ResumeCommand extends Command {
    constructor(client) {
        super(client, {
            name: "resume",
            group: "player",
            memberName: "resume",
            description: "Resumes the player.",
        });
    }
    run(message) {
        const dispatcher = message.guild.audioData
            .trackDispatcher;
        if (dispatcher)
            dispatcher.resume();
    }
};
