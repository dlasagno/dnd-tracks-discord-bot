"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseMessage = void 0;
const discord_js_1 = require("discord.js");
function getBaseMessage({ title = false, description = false } = {}) {
    const msg = new discord_js_1.MessageEmbed().setColor("#e40712");
    if (title)
        msg.setTitle("D&D tracks player");
    if (description)
        msg.setDescription("Play some tracks while you play D&D");
    return msg;
}
exports.getBaseMessage = getBaseMessage;
