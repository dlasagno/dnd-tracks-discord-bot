import fs from "fs";
import path from "path";

const saveFilePath = path.join(__dirname, "../../tracks.json");

type TracksMap = { [trackName: string]: Array<string> };

export const getUrls = (): TracksMap =>
  JSON.parse(fs.readFileSync(saveFilePath).toString());

export const saveUrls = (audioUrls: TracksMap) =>
  fs.writeFileSync(saveFilePath, JSON.stringify(audioUrls, undefined, 4));
