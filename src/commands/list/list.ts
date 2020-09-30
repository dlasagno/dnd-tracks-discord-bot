import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import * as tracksManager from "../../common/tracks-manager";
import * as messageFormatter from "../../common/message-formatter";
import { getTrackTitle } from "../../common/utils";

module.exports = class ListCommand extends Command {
  constructor(client: CommandoClient) {
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

  async run(message: CommandoMessage, { trackName }: { trackName: string }) {
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

    return message.message;
  }
};
