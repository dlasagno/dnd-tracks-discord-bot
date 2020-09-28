const fs = require('fs');
const path = require('path');

const saveFilePath = path.join(__dirname, '../tracks.json');

exports.getUrls = () => JSON.parse(fs.readFileSync(saveFilePath));
exports.saveUrls = audioUrls => fs.writeFileSync(saveFilePath, JSON.stringify(audioUrls, undefined, 4));
