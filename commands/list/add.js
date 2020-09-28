const { Command } = require("discord.js-commando");
const tracksManager = require("../../src/tracks-manager");
const messageFormatter = require("../../src/message-formatter");
const { getTrackTitle } = require("../../src/utils");
const ytdl = require("ytdl-core");
const chalk = require("chalk");

module.exports = class AddCommand extends Command {
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
              return Boolean(ytdl.validateID(ytdl.getVideoID(url)));
            } catch {
              return false;
            }
          },
          parse: (url) => `https://youtube.com/watch?v=${ytdl.getVideoID(url)}`,
        },
      ],
      throttling: {
        usages: 1,
        duration: 2,
      },
    });
  }

  async run(message, { trackName, url }) {
    const trackUrls = tracksManager.getUrls();

    if (!(trackName in trackUrls)) trackUrls[trackName] = [];

    trackUrls[trackName].push(url);
    tracksManager.saveUrls(trackUrls);

    console.log(`Added ${chalk.blue(url)} to ${chalk.magenta(trackName)}`);
    message.embed(
      messageFormatter
        .getBaseMessage()
        .addField(
          "Track added",
          `${await getTrackTitle(url)} added to ${trackName}`
        )
    );
  }
};