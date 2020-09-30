import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import * as tracksManager from "../../common/tracks-manager";
import * as messageFormatter from "../../common/message-formatter";
import { getTrackTitle } from "../../common/utils";
import ytdl from "ytdl-core";
import chalk from "chalk";

module.exports = class AddCommand extends Command {
  constructor(client: CommandoClient) {
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
          validate: (url: string) => {
            try {
              return Boolean(ytdl.validateID(ytdl.getVideoID(url)));
            } catch {
              return false;
            }
          },
          parse: (url: string) =>
            `https://youtube.com/watch?v=${ytdl.getVideoID(url)}`,
        },
      ],
      throttling: {
        usages: 1,
        duration: 2,
      },
    });
  }

  async run(
    message: CommandoMessage,
    { trackName, url }: { trackName: string; url: string }
  ) {
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

    return message.message;
  }
};
