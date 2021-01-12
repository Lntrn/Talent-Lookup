const fs = require("fs");

const Channels = require("../utilities/channels.js");
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));
const databaseRef = require("../databaseRef/dbTalentSearch.js");
const Format = require("../utilities/format.js");
const Discord = require("discord.js");
const Emojis = require("../utilities/emojis.js");

//args.join(" ")

module.exports = {
			name: "talentSearch",
			aliases: ["ts", "talents"],
			description: "Checks for multiple talents in the database.",  
			id: "1560",
	    execute(client, message, args) {
			databaseRef.multiLogin(client, message, args);
      	}
};
