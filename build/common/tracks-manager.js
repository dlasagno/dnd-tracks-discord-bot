"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUrls = exports.getUrls = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const saveFilePath = path_1.default.join(__dirname, "../../tracks.json");
exports.getUrls = () => JSON.parse(fs_1.default.readFileSync(saveFilePath).toString());
exports.saveUrls = (audioUrls) => fs_1.default.writeFileSync(saveFilePath, JSON.stringify(audioUrls, undefined, 4));
