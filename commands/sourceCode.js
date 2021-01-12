const fs = require("fs");

const Channels = require("../utilities/channels.js");
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));
const CommandLog = require("../utilities/commandLog.js");
const Format = require("../utilities/format.js");
const Discord = require("discord.js");
const Emojis = require("../utilities/emojis.js");

module.exports = {
			name: "sourceCode",
			aliases: ["source"],
	    execute(client, message, args) {

		message.author.send("https://github.com/Lntrn/Talent-Lookup");
		message.channel.send("Check your dms!");

		CommandLog.logCommand(client, message, message.guild.id, "source");
      	}
};