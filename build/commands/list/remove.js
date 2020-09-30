"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_commando_1 = require("discord.js-commando");
const tracksManager = __importStar(require("../../common/tracks-manager"));
const messageFormatter = __importStar(require("../../common/message-formatter"));
const utils_1 = require("../../common/utils");
const chalk_1 = __importDefault(require("chalk"));
module.exports = class RemoveCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: "remove",
            aliases: ["r"],
            group: "list",
            memberName: "remove",
            description: "Removes the specified track from the list.",
            args: [
                {
                    key: "trackName",
                    prompt: "What's the name of the track?",
                    type: "string",
                    validate: (trackName) => trackName in tracksManager.getUrls(),
                },
                {
                    key: "index",
                    prompt: "What's the index of the track?",
                    type: "integer",
                    validate: (index) => index >= 0,
                },
            ],
            throttling: {
                usages: 1,
                duration: 1,
            },
        });
    }
    run(message, { trackName, index }) {
        return __awaiter(this, void 0, void 0, function* () {
            const trackUrls = tracksManager.getUrls();
            let removedUrl = "";
            if (index >= trackUrls[trackName].length) {
                return message.reply("Couldn't find the specified track");
            }
            trackUrls[trackName] = trackUrls[trackName].filter((url, i) => {
                if (i != Number(index))
                    return true;
                removedUrl = url;
                return false;
            });
            tracksManager.saveUrls(trackUrls);
            console.log(`Removed ${chalk_1.default.blue(removedUrl)} from ${chalk_1.default.magenta(trackName)}`);
            message.embed(messageFormatter
                .getBaseMessage()
                .addField("Track removed", `${yield utils_1.getTrackTitle(removedUrl)}(${index}) removed from ${trackName}`));
            return message.message;
        });
    }
};
