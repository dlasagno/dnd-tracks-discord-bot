import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import * as tracksManager from "../../common/tracks-manager";
import * as messageFormatter from "../../common/message-formatter";
import { getTrackTitle, playTrack } from "../../common/utils";
import ytdl from "ytdl-core";
import chalk from "chalk";
import { PlayerProvider } from "../..";

module.exports = class PlayCommand extends Command {
  constructor(client: CommandoClient) {
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
          validate: (trackName: string) => trackName in tracksManager.getUrls(),
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

  async run(
    message: CommandoMessage,
    { trackName, index }: { trackName: string; index: number }
  ) {
    const playerProvider = (message.guild as unknown) as PlayerProvider;
    const trackUrls = tracksManager.getUrls();
    const queue: Array<[index: number, url: string]> = [];

    if (index >= 0 && index < trackUrls[trackName].length) {
      queue.push([index, trackUrls[trackName][index]]);
    } else if (index < 0) {
      queue.push(
        ...trackUrls[trackName].map((url, i): [number, string] => [i, url])
      );
    } else {
      return message.reply("Couldn't find the specified track");
    }

    for (let i = queue.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    let url: string;
    [index, url] = queue.shift() as [number, string];
    queue.push([index, url]);

    const connection = await message.member.voice.channel?.join();
    if (connection)
      console.log(
        `Joined voice channel: ${chalk.magenta(connection.channel.name)}`
      );
    else return message.reply("Couldn't connect to the voice channel");

    playerProvider.audioData.trackDispatcher = playTrack(connection, url);
    console.log(
      `Playing: ${index} - ${chalk.blue(url)} of ${chalk.magenta(trackName)}`
    );
    message.channel.send(
      messageFormatter
        .getBaseMessage()
        .addField("Playing", `${index} - ${await getTrackTitle(url)}`)
    );

    playerProvider.audioData = {
      ...playerProvider.audioData,
      queue,
      trackDispatcher: connection.dispatcher,
    };

    connection.dispatcher.on("finish", async function playNext() {
      if (queue.length === 0) return;

      [index, url] = queue.shift() as [number, string];
      queue.push([index, url]);

      playerProvider.audioData.trackDispatcher = playTrack(connection, url);
      playerProvider.audioData.trackDispatcher.on("finish", playNext);

      console.log(
        `Playing: ${index} - ${chalk.blue(url)} of ${chalk.magenta(trackName)}`
      );
      message.channel.send(
        messageFormatter
          .getBaseMessage()
          .addField("Playing", `${index} - ${await getTrackTitle(url)}`)
      );
    });

    return message.message;
  }
};
