const fs = require("fs");

const Channels = require("../utilities/channels.js");
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));
const Format = require("../utilities/format.js");
const Discord = require("discord.js");
const Emojis = require("../utilities/emojis.js");

module.exports = {
			name: "helpCommand",
			aliases: ["help", "ivefallenandcantgetup"],
			description: "guess what it does",  //lol
			id: "5026",
	    execute(client, message, args) {

			const helpEmbed = new Discord.MessageEmbed()
			.setColor("#ff7518")
			.setTitle(`🎃  ** Welcome to Pumpkin**   🎃`)
			.setDescription(``)
			.addField(`\`talentSearch\``, `> Checks for multiple talents, seperated by commas, in the database.\n> Aliases: \`ts\`, \`talents\`\n> ex. <@${client.user.id}> ts <talent one>, <talent two>, etc...`)
			//.addField(`\`reagentSearch\``, `> Buggy. Posts wiki link for reagent and looks for reagent locations and posts them to discord.\n> Aliases: \`regsearch\`, \`regs\`\n> <@782434037179613195> ts <talent one>, <talent two>, etc...`)

		message.channel.send(helpEmbed);
      	}
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function howToUseEmbed(client, message, args) {
	let howToEmbed = new Discord.MessageEmbed()
		.setColor("#ff7518")
		.setDescription(``)
}