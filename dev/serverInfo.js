const fs = require("fs");
// require discord.js module
const Discord = require("discord.js");
// require emojis.js module
const Emojis = require("../utilities/emojis.js");
// require format.js module
const Format = require("../utilities/format.js");
// require channels.js module
const Channels = require("../utilities/channels.js");
// require error logger module
const ErrorLog = require("../utilities/error.js");
// require  config
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));

module.exports = {
    name: "serverInfo",
    aliases: "server",
    description: "owner command to check data on the servers the bot is currently in",
    async execute(client, message) {

        console.log("before if")
        if (message.author.id !== Config.ownerID) {
            console.log("during if")
    		return message.channel.send("no access");
        }
        console.log("after if")
        
        let servers = client.guilds.cache.array().sort();
        let pageCount = Math.floor(servers.length / 20) + 1;
        let memberCount = Format.memberCount(client);

        try {
            console.log("in try")
            const sentMsg = await message.send(generatePage(client, servers, memberCount, 1, pageCount));
            
            let page = 1;

            // generate reactions
            sentMsg.react("⬅️");
            sentMsg.react("➡️");

            // reaction filters
            const leftFilter = (reaction, user) => reaction.emoji.name === "⬅️" && user.id === message.author.id;
            const rightFilter = (reaction, user) => reaction.emoji.name === "➡️" && user.id === message.author.id;

            // collectors (parse for 60 seconds)
            const leftCollector = sentMsg.createReactionCollector(leftFilter, {time: 60000});
            const rightCollector = sentMsg.createReactionCollector(rightFilter, {time: 60000});

            leftCollector.on("collect", 
                function() {
                    sentMsg.reactions.cache.get("⬅️").users.remove(message.author);
                    resetTimer(leftCollector, rightCollector);

                    if (page !== 1) { 
                        page--;
                        sentMsg.edit(generatePage(client, servers, memberCount, page, pageCount));
                    } 
                }
            );
            
            rightCollector.on("collect", 
                function() {
                    sentMsg.reactions.cache.get("➡️").users.remove(message.author);
                    resetTimer(leftCollector, rightCollector);

                    if (page !== pageCount) {
                        page++;      
                        sentMsg.edit(generatePage(client, servers, memberCount, page, pageCount));
                    } 
                }
            );

            // edit message when reaction collectors expire
            rightCollector.on("end", 
                function() {
                    sentMsg.edit(Format.expirationNotice, generatePage(client, servers, memberCount, page, pageCount));
                }
            );

        } catch (err) {
            ErrorLog.log(client, message, message.guild.id, "servers", err);
        }
    }
}

function resetTimer(left, right) {
    left.resetTimer({time: 60000});
    right.resetTimer({time: 60000});
}

function generatePage(client, servers, memberCount, page, pageCount) {
    console.log("in generatePage")
    let start = (page - 1) * 20;
    
    if (start <= servers.length - 1) {
        console.log(start)
        let serverList = "";
        let dataList = "";
        let idList = "";
        let date = new Date();

        let i;
        for (i = start; (i < start + 20 && i < servers.length); i++) {
            joinDate = servers[i].joinedAt;
            
            serverList += `\n**${i + 1}.** ${servers[i].name}`;
            if (joinDate.toDateString() === date.toDateString())
                serverList += " 🆕";

            dataList += `\n${joinDate.toDateString()}`;
            idList += `\n${servers[i].id}`
        }

        let embed = new Discord.MessageEmbed()
            .setColor("#D5AB88")
            .setTitle(":notebook_with_decorative_cover: **━━━━━━━━ client SERVER DATA ━━━━━━━━** :notebook_with_decorative_cover:")
            .setDescription(`Logged in as **${client.user.tag}**!`
                        + `\n\nHelping **${memberCount}** members`
                        + `\nIn **${client.guilds.cache.size}** server(s):`)
            .addField("NAME", `${serverList}`, true)
            .addField("DATE ADDED", `${dataList}`, true)
            .addField("ID", `${idList}`, true)
            .addField("\u200b", `page **${page}** of **${pageCount}**`)
            .addField("\u200b", "\u200b")
            .setFooter(Format.footer.text, Format.footer.image);

        return embed;

    } else {
        let embed = new Discord.MessageEmbed()
            .setColor("#D5AB88")
            .setTitle(":notebook_with_decorative_cover: **━━━━━━━━ client SERVER DATA ━━━━━━━━** :notebook_with_decorative_cover:")
            .setDescription(`Logged in as **${client.user.tag}**!`
                        + `\n\nHelping **${memberCount}** members`
                        + `\nIn **${client.guilds.cache.size}** server(s):`)
            .addField("\u200b", "empty page")
            .addField("\u200b", `page **${page}** of **${pageCount}**`)
            .addField("\u200b", "\u200b")
            .setFooter(Format.footer.text, Format.footer.image);

        return embed;
    }
}