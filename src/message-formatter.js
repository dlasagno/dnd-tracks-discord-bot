const MessageEmbed = require('discord.js').MessageEmbed;

exports.getBaseMessage = ({title = false, description = false} = {}) => {
  const msg = new MessageEmbed()
    .setColor('#e40712');
  
  if (title) msg.setTitle('D&D tracks player');
  if (description) msg.setDescription('Play some tracks while you play D&D');

  return msg;
}

exports.error= (description) => {
  return this.getBaseMessage().addField('Error', description);
}
