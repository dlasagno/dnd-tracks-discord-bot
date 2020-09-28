const { Command } = require("discord.js-commando");
const tracksManager = require("../../src/tracks-manager");
const messageFormatter = require("../../src/message-formatter");
const ytdl = require("ytdl-core");
const chalk = require("chalk");

module.exports = class RemoveCommand extends Command {
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
          prompt: "The name of the track",
          type: "string",
        },
        {
          key: "index",
          prompt: "The index of the track",
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

  async run(message, { trackName, index }) {
    const trackUrls = tracksManager.getUrls();
    let removedUrl;

    if (trackName in trackUrls) {
      trackUrls[trackName] = trackUrls[trackName].filter((url, i) => {
        if (i != Number(index)) return true;

        removedUrl = url;
        return false;
      });
      if (trackUrls[trackName].length === 0) trackUrls[trackName] = undefined;
      tracksManager.saveUrls(trackUrls);
    }

    if (removedUrl) {
      console.log(
        `Removed ${chalk.blue(removedUrl)} from ${chalk.magenta(trackName)}`
      );
      message.embed(
        messageFormatter
          .getBaseMessage()
          .addField(
            "Track removed",
            `${await getTrackTitle(
              removedUrl
            )}(${index}) removed from ${trackName}`
          )
      );
    } else {
      message.reply("Couldn't find the specified track");
    }
  }
};
