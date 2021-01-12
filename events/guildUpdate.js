// require discord.js module
const Discord = require("discord.js");
// require format.js module
const Format = require("../utilities/format.js");
// require channels.js module
const Channels = require("../utilities/channels.js");
// require error logger module
const ErrorLog = require("../utilities/error.js");

module.exports = {
    name: "guildUpdate",
    description: "notifications for name changes for servers using the client",
    execute(client, oldGuild, newGuild) {
        if (oldGuild.name !== newGuild.name) {
            date = new Date();

            const log = new Discord.MessageEmbed()
                .setColor("#FFD983")
                .setTitle(":label: **━━━━━ SERVER NAME CHANGE ━━━━━** :label:")
                .setDescription(`\n**Old Name:** ${oldGuild.name}`
                                + `\n**New Name:** ${newGuild.name}`
                                + `\n**Date:** ${date.toDateString()}`)

            client.channels.cache.get(Channels.botStatus.id).send(log).catch(err => ErrorLog.log(client, msg, msg.guild.id, `guildUpdate [${oldGuild}, ${newGuild}]`, err));
        }
    }
}
