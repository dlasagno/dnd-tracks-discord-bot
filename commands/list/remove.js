const { Command } = require("discord.js-commando");
const tracksManager = require("../../common/tracks-manager");
const messageFormatter = require("../../common/message-formatter");
const { getTrackTitle } = require("../../common/utils");
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

  async run(message, { trackName, index }) {
    const trackUrls = tracksManager.getUrls();
    let removedUrl;

    if (index >= trackUrls[trackName].length) {
      message.reply("Couldn't find the specified track");
      return;
    }

    trackUrls[trackName] = trackUrls[trackName].filter((url, i) => {
      if (i != Number(index)) return true;

      removedUrl = url;
      return false;
    });
    tracksManager.saveUrls(trackUrls);

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
  }
};
