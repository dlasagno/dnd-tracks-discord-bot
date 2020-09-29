const { Command } = require("discord.js-commando");
const tracksManager = require("../../common/tracks-manager");
const messageFormatter = require("../../common/message-formatter");
const { getTrackTitle, playTrack } = require("../../common/utils");
const ytdl = require("ytdl-core");
const chalk = require("chalk");

module.exports = class PlayCommand extends Command {
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

  async run(message, { trackName, index }) {
    const trackUrls = tracksManager.getUrls();
    const queue = [];
    message.guild.audioData.queue;

    if (index >= 0 && index < trackUrls[trackName].length) {
      queue.push([index, trackUrls[trackName][index]]);
    } else if (index < 0) {
      queue.push(...trackUrls[trackName].map((url, i) => [i, url]));
    } else {
      message.reply("Couldn't find the specified track");
      return;
    }

    for (let i = queue.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    let url;
    [index, url] = queue.shift();
    queue.push([index, url]);

    const connection = await message.member.voice.channel.join();
    console.log(
      `Joined voice channel: ${chalk.magenta(connection.channel.name)}`
    );

    message.guild.audioData.dispatcher = playTrack(connection, url);
    console.log(
      `Playing: ${index} - ${chalk.blue(url)} of ${chalk.magenta(trackName)}`
    );
    message.channel.send(
      messageFormatter
        .getBaseMessage()
        .addField("Playing", `${index} - ${await getTrackTitle(url)}`)
    );

    message.guild.audioData = {
      ...message.guild.audioData,
      queue,
      trackDispatcher: connection.dispatcher,
    };

    connection.dispatcher.on("finish", async function playNext() {
      if (queue.length === 0) return;

      [index, url] = queue.shift();
      queue.push([index, url]);

      message.guild.audioData.trackDispatcher = playTrack(connection, url);
      message.guild.audioData.trackDispatcher.on("finish", playNext);

      console.log(
        `Playing: ${index} - ${chalk.blue(url)} of ${chalk.magenta(trackName)}`
      );
      message.channel.send(
        messageFormatter
          .getBaseMessage()
          .addField("Playing", `${index} - ${await getTrackTitle(url)}`)
      );
    });
  }
};
