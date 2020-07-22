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
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('d.help');
});

client.on('message', msg => {
  if (commander.isCommand(msg.content)) {
    console.log(`Received command: ${msg.content}`);
    commander.execute(msg);
  }
});


async function getTrackTitle(url, linked = true) {
  if (linked) {
    return `[${(await ytdl.getBasicInfo(url)).videoDetails.title}](${url})`;
  }
  else {
    return `${(await ytdl.getBasicInfo(url)).videoDetails.title}`;
  }
}

async function playTrack(channel, url) {
  currentConnection = await channel.join();

  console.log(`Joined voice channel: ${currentConnection.channel.name}`);
  const dispatcher = currentConnection.play(ytdl(url, {
    filter: 'audioonly'
  }));
}


commander.addCommand(new Command({
  name: 'add',
  description: 'adds the specified track to the list',
  action: async (msg, name, url) => {
    const trackUrls = tracksManager.getUrls();

    if (!(name in trackUrls)) {
      trackUrls[name] = [];
    }
    trackUrls[name].push(url);
    tracksManager.saveUrls(trackUrls);

    console.log(`Added ${url} to ${name}`);
    msg.channel.send(messageFormatter.getBaseMessage().addField('Track added', `${await getTrackTitle(url)} added to ${name}`));
  },
  argHelp: '<track-name> <url>',
  aliases: ['a']
}))

commander.addCommand(new Command({
  name: 'remove',
  description: 'removes the specified track from the list',
  action: async (msg, name, index) => {
    const trackUrls = tracksManager.getUrls();
    let removedUrl;

    if (name in trackUrls) {
      if (!index) {
        msg.channel.send(messageFormatter.getBaseMessage().addField('Missing index: use one of those', (await Promise.all(trackUrls[name]
          .map(async (url, i) => `${i+1} - ${await getTrackTitle(url)}`)))
          .join('\n')));
        return;
      }

      trackUrls[name] = trackUrls[name].filter((url, i) => {
        if (i != Number(index)) return true;
        removedUrl = url
        return false;
      });
      if (trackUrls[name].length === 0) trackUrls[name] = undefined;
      tracksManager.saveUrls(trackUrls);
    }

    if (removedUrl) {
      console.log(`Removed ${removedUrl} from ${name}`);
      msg.channel.send(messageFormatter.getBaseMessage().addField('Track removed', `${await getTrackTitle(removedUrl)}(${index}) removed from ${name}`));
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
    if (index == undefined) index = Math.floor(Math.random() * Math.floor(trackUrls[trackName].length));

    if (trackName in trackUrls && index >= 0 && index < trackUrls[trackName].length) {
      const trackUrl = trackUrls[trackName][index];
      playTrack(msg.member.voice.channel, trackUrl);

      console.log(`Playing: ${index} - ${trackUrl} of ${trackName}`);
      msg.channel.send(messageFormatter.getBaseMessage().addField('Playing', `${index} - ${await getTrackTitle(trackUrl)}`));
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
      msg.channel.send(messageFormatter.getBaseMessage().addField(`Tracks for ${trackName}`, (await Promise.all(trackUrls[trackName]
        .map(async (url, i) => `${i+1} - ${await getTrackTitle(url)}`)))
        .join('\n')));
    }
    else {
      msg.channel.send(messageFormatter.getBaseMessage()
      .addField('List of tracks', `\n${Object.entries(tracksManager.getUrls())
        .map(([key, value]) => `${key} (${value.length})`)
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
      
      console.log(`Left voice channel: ${currentConnection.channel.name}`);
      currentConnection = null;
    }
  },
  aliases: ['l']
}));


client.login(process.env.DISCORD_TOKEN);
