import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import * as tracksManager from "../../common/tracks-manager";
import * as messageFormatter from "../../common/message-formatter";
import { getTrackTitle } from "../../common/utils";
import chalk from "chalk";

module.exports = class RemoveCommand extends Command {
  constructor(client: CommandoClient) {
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
          validate: (trackName: string) => trackName in tracksManager.getUrls(),
        },
        {
          key: "index",
          prompt: "What's the index of the track?",
          type: "integer",
          validate: (index: number) => index >= 0,
        },
      ],
      throttling: {
        usages: 1,
        duration: 1,
      },
    });
  }

  async run(
    message: CommandoMessage,
    { trackName, index }: { trackName: string; index: number }
  ) {
    const trackUrls = tracksManager.getUrls();
    let removedUrl = "";

    if (index >= trackUrls[trackName].length) {
      return message.reply("Couldn't find the specified track");
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

    return message.message;
  }
};
