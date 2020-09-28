const { Command } = require("discord.js-commando");
const tracksManager = require("../../src/tracks-manager");
const messageFormatter = require("../../src/message-formatter");
const { getTrackTitle } = require("../../src/utils");

module.exports = class ListCommand extends Command {
  constructor(client) {
    super(client, {
      name: "list",
      aliases: ["ls"],
      group: "list",
      memberName: "list",
      description: "Lists the available tracks.",
      args: [
        {
          key: "trackName",
          prompt: "What's the name of the track?",
          type: "string",
          default: "",
        },
      ],
      throttling: {
        usages: 1,
        duration: 1,
      },
    });
  }

  async run(message, { trackName }) {
    const trackUrls = tracksManager.getUrls();

    if (trackName in trackUrls) {
      message.embed(
        messageFormatter
          .getBaseMessage()
          .addField(
            `Tracks for ${trackName}`,
            (
              await Promise.all(
                trackUrls[trackName].map(
                  async (url, i) => `${i} - ${await getTrackTitle(url)}`
                )
              )
            ).join("\n")
          )
      );
    } else {
      message.embed(
        messageFormatter.getBaseMessage().addField(
          "List of tracks",
          `\n${Object.entries(tracksManager.getUrls())
            .map(([key, value]) => `${key} (${value.length})`)
            .sort()
            .join("\n")}`
        )
      );
    }
  }
};
