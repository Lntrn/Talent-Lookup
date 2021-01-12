// require discord.js module
const Discord = require("discord.js");
// require format.js module
const Format = require("../utilities/format.js");
// require channels.js module
const Channels = require("../utilities/channels.js");
// require error logger module
const ErrorLog = require("../utilities/error.js");

module.exports = {
    name: "guildDelete",
    description: "notifications for new servers using the client",
    execute(client, guild) {
        date = new Date();

        const log = new Discord.MessageEmbed()
            .setColor("#ff7518")
            .setTitle(":sob: **━━━━━ SERVER LEFT ━━━━━** :sob:")
            .setDescription(`\n**Server:** ${guild}`
                            + `\n**Date:** ${date.toDateString()}`)

        client.channels.cache.get(Channels.botStatus.id).send(log).catch(err => ErrorLog.log(client, msg, msg.guild.id, `guildDelete [${guild}]`, err));
    }
}
