import { VoiceConnection } from "discord.js";
import ytdl from "ytdl-core";

export async function getTrackTitle(url: string, linked = true) {
  let trackTitle = (await ytdl.getBasicInfo(url)).videoDetails.title;
  if (linked) trackTitle = `[${trackTitle}](${url})`;

  return trackTitle;
}

export function playTrack(connection: VoiceConnection, url: string) {
  return connection.play(
    ytdl(url, {
      filter: "audioonly",
    })
  );
}
