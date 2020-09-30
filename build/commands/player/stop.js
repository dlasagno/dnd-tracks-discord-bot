"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Command } = require("discord.js-commando");
module.exports = class StopCommand extends Command {
    constructor(client) {
        super(client, {
            name: "stop",
            group: "player",
            memberName: "stop",
            description: "Stops the player, emptying its queue.",
        });
    }
    run(message) {
        const playerProvider = message.guild;
        const dispatcher = playerProvider.audioData.trackDispatcher;
        if (dispatcher) {
            playerProvider.audioData.queue.length = 0;
            dispatcher.end();
        }
    }
};
