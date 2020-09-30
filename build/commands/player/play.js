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
module.exports = class PlayCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: "play",
            aliases: ["p"],
            group: "player",
            memberName: "play",
            description: "Plays the specified track.",
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
                    min: 0,
                    default: -1,
                },
            ],
        });
    }
    run(message, { trackName, index }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const playerProvider = message.guild;
            const trackUrls = tracksManager.getUrls();
            const queue = [];
            if (index >= 0 && index < trackUrls[trackName].length) {
                queue.push([index, trackUrls[trackName][index]]);
            }
            else if (index < 0) {
                queue.push(...trackUrls[trackName].map((url, i) => [i, url]));
            }
            else {
                return message.reply("Couldn't find the specified track");
            }
            for (let i = queue.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [queue[i], queue[j]] = [queue[j], queue[i]];
            }
            let url;
            [index, url] = queue.shift();
            queue.push([index, url]);
            const connection = yield ((_a = message.member.voice.channel) === null || _a === void 0 ? void 0 : _a.join());
            if (connection)
                console.log(`Joined voice channel: ${chalk_1.default.magenta(connection.channel.name)}`);
            else
                return message.reply("Couldn't connect to the voice channel");
            playerProvider.audioData.trackDispatcher = utils_1.playTrack(connection, url);
            console.log(`Playing: ${index} - ${chalk_1.default.blue(url)} of ${chalk_1.default.magenta(trackName)}`);
            message.channel.send(messageFormatter
                .getBaseMessage()
                .addField("Playing", `${index} - ${yield utils_1.getTrackTitle(url)}`));
            playerProvider.audioData = Object.assign(Object.assign({}, playerProvider.audioData), { queue, trackDispatcher: connection.dispatcher });
            connection.dispatcher.on("finish", function playNext() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (queue.length === 0)
                        return;
                    [index, url] = queue.shift();
                    queue.push([index, url]);
                    playerProvider.audioData.trackDispatcher = utils_1.playTrack(connection, url);
                    playerProvider.audioData.trackDispatcher.on("finish", playNext);
                    console.log(`Playing: ${index} - ${chalk_1.default.blue(url)} of ${chalk_1.default.magenta(trackName)}`);
                    message.channel.send(messageFormatter
                        .getBaseMessage()
                        .addField("Playing", `${index} - ${yield utils_1.getTrackTitle(url)}`));
                });
            });
            return message.message;
        });
    }
};
