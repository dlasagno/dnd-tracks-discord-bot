const ytdl = require("ytdl-core");

exports.getTrackTitle = async (url, linked = true) => {
  let trackTitle = (await ytdl.getBasicInfo(url)).videoDetails.title;
  if (linked) trackTitle = `[${trackTitle}](${url})`;

  return trackTitle;
};

exports.playTrack = (connection, url) => {
  connection.play(
    ytdl(url, {
      filter: "audioonly",
    })
  );
};
