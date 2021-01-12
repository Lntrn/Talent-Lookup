// require discord.js module
const Discord = require("discord.js");
// require format.js module
const Format = require("./format.js");
// require channels.js module
const Channels = require("./channels.js");
// require error logger module
const ErrorLog = require("./error.js");

module.exports = {
    name: "commandLog",
    description: "notifications for new servers using the client",

    async logCommand(client, message, serverID, command) {
        // only log if not testing
            date = new Date();

            const log = new Discord.MessageEmbed()
                .setColor("#310ff5")
                .setDescription(`**Command Used:** \`${command}\``
                                + `\n**User:** ${message.author}`
                                + `\n**Server:** ${client.guilds.cache.get(serverID).name}`
                                + `\n**Channel:** ${message.channel}`
                                + `\n**Date:** ${date.toDateString()}`)

            client.channels.cache.get(Channels.commandLog.id).send(log);

    },
}


