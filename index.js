require("dotenv").config();

const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const chalk = require("chalk");

const tracksManager = require("./src/tracks-manager");
const messageFormatter = require("./src/message-formatter");
const Commander = require("./src/commander");
const Command = require("./src/command");

const client = new Discord.Client();
const commander = new Commander("d.");

let currentConnection = null;
let playQueue = [];

client.on("ready", () => {
  console.log(`Logged in as ${chalk.magenta(client.user.tag)}!`);

  client.user.setActivity("d.help", { type: "LISTENING" });
});

client.on("message", (msg) => {
  if (commander.isCommand(msg.content)) {
    console.log();
    console.log(
      `${chalk.cyan(
        new Date().toLocaleTimeString()
      )} - Received command from ${chalk.magenta(msg.author.tag)}: ${
        msg.content
      }`
    );

    commander.execute(msg);
  }
});

async function getTrackTitle(url, linked = true) {
  let trackTitle = (await ytdl.getBasicInfo(url)).videoDetails.title;
  if (linked) trackTitle = `[${trackTitle}](${url})`;

  return trackTitle;
}

async function playTrack(channel, url) {
  currentConnection = await channel.join();

  console.log(
    `Joined voice channel: ${chalk.magenta(currentConnection.channel.name)}`
  );

  currentConnection.play(
    ytdl(url, {
      filter: "audioonly",
    })
  );
}

commander.addCommand(
  new Command({
    name: "add",
    description: "adds the specified track to the list",
    action: async (msg, trackName, url) => {
      const trackUrls = tracksManager.getUrls();

      if (!(trackName in trackUrls)) trackUrls[trackName] = [];

      trackUrls[trackName].push(url);
      tracksManager.saveUrls(trackUrls);

      console.log(`Added ${chalk.blue(url)} to ${chalk.magenta(trackName)}`);
      msg.channel.send(
        messageFormatter
          .getBaseMessage()
          .addField(
            "Track added",
            `${await getTrackTitle(url)} added to ${trackName}`
          )
      );
    },
    argHelp: "<track-name> <url>",
    aliases: ["a"],
  })
);

commander.addCommand(
  new Command({
    name: "remove",
    description: "removes the specified track from the list",
    action: async (msg, trackName, index) => {
      const trackUrls = tracksManager.getUrls();
      let removedUrl;

      if (trackName in trackUrls) {
        if (!index) {
          msg.channel.send(
            messageFormatter
              .getBaseMessage()
              .addField(
                "Missing index: use one of those",
                (
                  await Promise.all(
                    trackUrls[trackName].map(
                      async (url, i) => `${i} - ${await getTrackTitle(url)}`
                    )
                  )
                ).join("\n")
              )
          );
          return;
        }

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
        msg.channel.send(
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
        msg.channel.send(
          messageFormatter.error("Couldn't find the specified track")
        );
      }
    },
    argHelp: "<track-name> <index>",
    aliases: ["r"],
  })
);

commander.addCommand(
  new Command({
    name: "play",
    description: "play the specified track",
    action: async (msg, trackName, index) => {
      const trackUrls = tracksManager.getUrls();
      let isContinuos = false;

      if (!trackName) {
        msg.channel.send(messageFormatter.error("No track was specified!"));
        return;
      }

      if (
        trackName in trackUrls &&
        index >= 0 &&
        index < trackUrls[trackName].length
      ) {
        playQueue = [index, trackUrls[trackName][index]];
      } else if (trackName in trackUrls && !index) {
        playQueue = [...trackUrls[trackName].map((url, i) => [i, url])];

        for (let i = playQueue.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          [playQueue[i], playQueue[j]] = [playQueue[j], playQueue[i]];
        }
      } else {
        msg.channel.send(
          messageFormatter.error("Couldn't find the specified track!")
        );
        return;
      }

      let url;
      [index, url] = playQueue.shift();
      await playTrack(msg.member.voice.channel, url);

      console.log(
        `Playing: ${index} - ${chalk.blue(url)} of ${chalk.magenta(trackName)}`
      );
      msg.channel.send(
        messageFormatter
          .getBaseMessage()
          .addField("Playing", `${index} - ${await getTrackTitle(url)}`)
      );

      currentConnection.dispatcher.on("finish", async () => {
        [index, url] = playQueue.shift();
        await playTrack(msg.member.voice.channel, url);

        console.log(
          `Playing: ${index} - ${chalk.blue(url)} of ${chalk.magenta(
            trackName
          )}`
        );
        msg.channel.send(
          messageFormatter
            .getBaseMessage()
            .addField("Playing", `${index} - ${await getTrackTitle(url)}`)
        );
      });
    },
    argHelp: "<track-name> [<index>]",
    aliases: ["p"],
  })
);

commander.addCommand(
  new Command({
    name: "pause",
    description: "pause the player",
    action: () => {
      if (currentConnection && currentConnection.dispatcher) {
        currentConnection.dispatcher.pause();

        console.log("Paused track");
      }
    },
  })
);

commander.addCommand(
  new Command({
    name: "resume",
    description: "resume the player",
    action: () => {
      if (currentConnection && currentConnection.dispatcher) {
        currentConnection.dispatcher.resume();

        console.log("Resumed track");
      }
    },
  })
);

commander.addCommand(
  new Command({
    name: "list",
    description: "list the available tracks",
    action: async (msg, trackName) => {
      const trackUrls = tracksManager.getUrls();

      if (trackName in trackUrls) {
        msg.channel.send(
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
        msg.channel.send(
          messageFormatter.getBaseMessage().addField(
            "List of tracks",
            `\n${Object.entries(tracksManager.getUrls())
              .map(([key, value]) => `${key} (${value.length})`)
              .sort()
              .join("\n")}`
          )
        );
      }
    },
    argHelp: "[<track-name>]",
    aliases: ["ls"],
  })
);

commander.addCommand(
  new Command({
    name: "leave",
    description: "leave the voice channel",
    action: () => {
      if (currentConnection) {
        currentConnection.disconnect();

        console.log(
          `Left voice channel: ${chalk.magenta(currentConnection.channel.name)}`
        );
        currentConnection = null;
      }
    },
    aliases: ["l"],
  })
);

client.login(process.env.DISCORD_TOKEN);
