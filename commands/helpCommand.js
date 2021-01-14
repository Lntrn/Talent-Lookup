const fs = require("fs");

const Channels = require("../utilities/channels.js");
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));
const CommandLog = require("../utilities/commandLog.js");
const Format = require("../utilities/format.js");
const Discord = require("discord.js");
const Emojis = require("../utilities/emojis.js");

module.exports = {
			name: "helpcommand",
			aliases: ["help", "ivefallenandcantgetup"],
			description: "",
			id: "5026",
	    async execute(client, message, args) {

			let page = "";

			const helpEmbed = new Discord.MessageEmbed()
				.setColor("#310ff5")
				.addField(` ‎`, `**Need help understanding the numbers after each talent? Try \`t!guide\`**\n*Prefix: **t!**\nUniversal Prefix: **<@${client.user.id}>***`)
				.addField(`\`sourceCode\``, `> Directly messages a link to the bot's Github page to the command author.\n> **Aliases**: \`source\`\n> ex. \<@${client.user.id}> sourceCode`)
				.addField(`\`talentSearch\``, `> Checks for multiple talents, seperated by commas, in the database.\n> **Aliases**: \`ts\`, \`talents\`\n> ex. <@${client.user.id}> ts <talent one>, <talent two>, etc...`)
				.addField(`\`talentsInbetween\` *whitelisted command*`, `> Checks for all talents inbetween two known talents. Can also filter by specific talent rank.\n> **Aliases**: \`tib\`\n> ex. <@${client.user.id}> tib spell proof, spell defying, rare`)
				//.addField(`\`reagentSearch\``, `> Buggy. Posts wiki link for reagent and looks for reagent locations and posts them to discord.\n> Aliases: \`regsearch\`, \`regs\`\n> <@782434037179613195> ts <talent one>, <talent two>, etc...`)

			message.channel.send(helpEmbed);

			// Log command
			CommandLog.logCommand(client, message, message.guild.id, "help");
      	}
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

