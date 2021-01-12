const fs = require("fs");

const Channels = require("../utilities/channels.js");
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));
const databaseRef = require("../databaseRef/dbtalentInbetween.js");
const CommandLog = require("../utilities/commandLog.js");
const Format = require("../utilities/format.js");
const Discord = require("discord.js");
const Emojis = require("../utilities/emojis.js");

//args.join(" ")

module.exports = {
			name: "talentInbetween",
            aliases: ["tib"],
            description: "Checks for a talents inbetween two known talents.",  
            usage: "<talent one>, <talent two>, [if they put in a rank then filter by that rank, if not then show all inbetween]",
			id: "3080",
	    execute(client, message, args) {

			let whitelist = ["750304052184612865", "341245605194104833"]

			if (whitelist.includes(message.author.id)) {
				databaseRef.searchFor(client, message, args);
				CommandLog.logCommand(client, message, message.guild.id, "talents Inbetween");
			} else { 
				message.channel.send("You do not have permission to use this command. If you would like to request access dm <@750304052184612865>");
			}
      	}
};
