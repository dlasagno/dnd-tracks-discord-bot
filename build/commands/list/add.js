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
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const chalk_1 = __importDefault(require("chalk"));
module.exports = class AddCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: "add",
            aliases: ["a"],
            group: "list",
            memberName: "add",
            description: "Add the specified track to the list.",
            args: [
                {
                    key: "trackName",
                    prompt: "What's the name of the track?",
                    type: "string",
                },
                {
                    key: "url",
                    prompt: "What's the youtube url of the track?",
                    type: "string",
                    validate: (url) => {
                        try {
                            return Boolean(ytdl_core_1.default.validateID(ytdl_core_1.default.getVideoID(url)));
                        }
                        catch (_a) {
                            return false;
                        }
                    },
                    parse: (url) => `https://youtube.com/watch?v=${ytdl_core_1.default.getVideoID(url)}`,
                },
            ],
            throttling: {
                usages: 1,
                duration: 2,
            },
        });
    }
    run(message, { trackName, url }) {
        return __awaiter(this, void 0, void 0, function* () {
            const trackUrls = tracksManager.getUrls();
            if (!(trackName in trackUrls))
                trackUrls[trackName] = [];
            trackUrls[trackName].push(url);
            tracksManager.saveUrls(trackUrls);
            console.log(`Added ${chalk_1.default.blue(url)} to ${chalk_1.default.magenta(trackName)}`);
            message.embed(messageFormatter
                .getBaseMessage()
                .addField("Track added", `${yield utils_1.getTrackTitle(url)} added to ${trackName}`));
            return message.message;
        });
    }
};
