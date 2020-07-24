require('dotenv').config();

const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const tracksManager = require('./src/tracks-manager');
const messageFormatter = require('./src/message-formatter');
const Commander = require('./src/commander');
const Command = require('./src/command');

const client = new Discord.Client();
const commander = new Commander('d.');

let currentConnection = null;


client.on('ready', () => {
  console.log(`Logged in as \x1b[35m${client.user.tag}\x1b[0m!`);
  
  client.user.setActivity('d.help');
});

client.on('message', msg => {
  if (commander.isCommand(msg.content)) {
    console.log();
    console.log(`\x1b[36m${new Date().toLocaleTimeString()}\x1b[0m - Received command from \x1b[35m${msg.author.tag}\x1b[0m: ${msg.content}`);

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

  console.log(`Joined voice channel: \x1b[35m${currentConnection.channel.name}\x1b[0m`);

  currentConnection.play(ytdl(url, {
    filter: 'audioonly'
  }));
}


commander.addCommand(new Command({
  name: 'add',
  description: 'adds the specified track to the list',
  action: async (msg, trackName, url) => {
    const trackUrls = tracksManager.getUrls();

    if (!(trackName in trackUrls)) trackUrls[trackName] = [];
    
    trackUrls[trackName].push(url);
    tracksManager.saveUrls(trackUrls);

    console.log(`Added \x1b[34m${url}\x1b[0m to \x1b[35m${trackName}\x1b[0m`);
    msg.channel.send(messageFormatter.getBaseMessage().addField('Track added', `${await getTrackTitle(url)} added to ${trackName}`));
  },
  argHelp: '<track-name> <url>',
  aliases: ['a']
}))

commander.addCommand(new Command({
  name: 'remove',
  description: 'removes the specified track from the list',
  action: async (msg, trackName, index) => {
    const trackUrls = tracksManager.getUrls();
    let removedUrl;

    if (trackName in trackUrls) {
      if (!index) {
        msg.channel.send(messageFormatter.getBaseMessage().addField('Missing index: use one of those', (await Promise.all(trackUrls[trackName]
          .map(async (url, i) => `${i} - ${await getTrackTitle(url)}`)))
          .join('\n')));
        return;
      }

      trackUrls[trackName] = trackUrls[trackName].filter((url, i) => {
        if (i != Number(index)) return true;

        removedUrl = url
        return false;
      });
      if (trackUrls[trackName].length === 0) trackUrls[trackName] = undefined;
      tracksManager.saveUrls(trackUrls);
    }

    if (removedUrl) {
      console.log(`Removed \x1b[34m${removedUrl}\x1b[0m from \x1b[35m${trackName}\x1b[0m`);
      msg.channel.send(messageFormatter.getBaseMessage().addField('Track removed', `${await getTrackTitle(removedUrl)}(${index}) removed from ${trackName}`));
    }
    else {
      msg.channel.send(messageFormatter.error('Couldn\'t find the specified track'))
    }
  },
  argHelp: '<track-name> <index>',
  aliases: ['r']
}));

commander.addCommand(new Command({
  name: 'play',
  description: 'play the specified track',
  action: async (msg, trackName, index) => {
    const trackUrls = tracksManager.getUrls();

    if (!trackName) {
      msg.channel.send(messageFormatter.error('No track was specified!'));
      return;
    }

    if (index == undefined) index = Math.floor(Math.random() * Math.floor(trackUrls[trackName].length));
    if (trackName in trackUrls && index >= 0 && index < trackUrls[trackName].length) {
      const url = trackUrls[trackName][index];
      playTrack(msg.member.voice.channel, url);

      console.log(`Playing: ${index} - \x1b[34m${url}\x1b[0m of \x1b[35m${trackName}\x1b[0m`);
      msg.channel.send(messageFormatter.getBaseMessage().addField('Playing', `${index} - ${await getTrackTitle(url)}`));
    }
    else {
      msg.channel.send(messageFormatter.error('Couldn\'t find the specified track!'));
    }
  },
  argHelp: '<track-name> [<index>]',
  aliases: ['p']
}));

commander.addCommand(new Command({
  name: 'pause',
  description: 'pause the player',
  action: () => {
    if (currentConnection) {
      currentConnection.dispatcher.pause();

      console.log('Paused track');
    }
  }
}));

commander.addCommand(new Command({
  name: 'resume',
  description: 'resume the player',
  action: () => {
    if (currentConnection) {
      currentConnection.dispatcher.resume();

      console.log('Resumed track');
    }
  }
}));

commander.addCommand(new Command({
  name: 'list',
  description: 'list the available tracks',
  action: async (msg, trackName) => {
    const trackUrls = tracksManager.getUrls();

    if (trackName in trackUrls) {
      msg.channel.send(messageFormatter.getBaseMessage()
        .addField(`Tracks for ${trackName}`, (await Promise.all(trackUrls[trackName]
          .map(async (url, i) => `${i} - ${await getTrackTitle(url)}`)))
          .join('\n')));
    }
    else {
      msg.channel.send(messageFormatter.getBaseMessage()
        .addField('List of tracks', `\n${Object.entries(tracksManager.getUrls())
          .map(([key, value]) => `${key} (${value.length})`)
          .sort()
          .join('\n')}`));
    }
  },
  argHelp: '[<track-name>]',
  aliases: ['ls']
}));

commander.addCommand(new Command({
  name: 'leave',
  description: 'leave the voice channel',
  action: () => {
    if (currentConnection) {
      currentConnection.disconnect();
      
      console.log(`Left voice channel: \x1b[34m${currentConnection.channel.name}\x1b[0m`);
      currentConnection = null;
    }
  },
  aliases: ['l']
}));


client.login(process.env.DISCORD_TOKEN);
