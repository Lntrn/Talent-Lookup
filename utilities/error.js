const fs = require("fs");

// require discord.js module
const Discord = require("discord.js");
// require channels.js module
const Channels = require("../utilities/channels.js");
// require format.js module
const Format = require("../utilities/format.js");

module.exports = {
    name: "error",
    description: "sends errors that client encounters to a logging channel",
    log(client, message, serverID, cmd, error) { // eventually remove serverID from paramaters (can be obtained from message)
        date = new Date();

        const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));

        // if the error was due to lack of permissions DM command issuer
        if (error.code === Discord.Constants.APIErrors.MISSING_PERMISSIONS) {
            const perms = new Discord.MessageEmbed()
                .setColor("#DD2E44")
                .setTitle(":exclamation: **━━━━━━━━━━━ ERROR ━━━━━━━━━━━** :exclamation:")
                .setDescription(`It seems I don't have permission to send messages in **${message.channel}**!`
                                + `\n\nPlease make sure I have the following permissions:`
                                + `\n▫️**Send Messages**`
                                + `\n▫️**Read Messages**`
                                + `\n▫️**Manage Messages**`
                                + `\n▫️**Read Message History**`
                                + `\n▫️**Use External Emojis**`
                                + `\n▫️**Add Reactions**`
                                + `\n▫️**Embed Links**`
                                + `\n\nIf you can't grant those permissions in **${client.guilds.cache.get(serverID).name}**, please notify a member of the staff team`
                                + `\n\nThanks`)

            message.author.send(perms).catch((err) => {
                client.users.fetch(Config.ownerID).then(
                    function(user) {
                        const sendError = new Discord.MessageEmbed()
                            .setColor("#DD2E44")
                            .setTitle(":exclamation: **━━━━━━━━━━━ ERROR ━━━━━━━━━━━** :exclamation:")
                            .setDescription(`Couldn't DM user ${message.author}! Check ${Channels.errorLog.pub} for Permissions error`
                                            + `\n\n**Error:**`
                                            + `\n${err}`)

                        user.send(sendError);
                    }
                )
            });
        }

        const log = new Discord.MessageEmbed()
            .setColor("#DD2E44")
            .setTitle(":exclamation: **━━━━━━━━━━━ ERROR ━━━━━━━━━━━** :exclamation:")
            .setDescription(`**Command Used:** ${cmd}`
                            + `\n**User:** ${message.author}`
                            + `\n**Server:** ${client.guilds.cache.get(serverID).name}`
                            + `\n**Channel:** ${message.channel}`
                            + `\n**Date:** ${date.toDateString()}`
                            + `\n\n**Error:**`
                            + `\n${error}`)

        client.channels.cache.get(Channels.errorLog.id).send(log);
    }
}
