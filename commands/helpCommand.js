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
	    execute(client, message, args) {

			const helpEmbed = new Discord.MessageEmbed()
				.setColor("#310ff5")
				.addField(` ‎`, `[**Click here ‎for help with the numbers**](http://www.wizard101central.com/forums/showthread.php?486420-Beginner-s-Guide-to-Project-O)\n*Prefix: **t!**\nUniversal Prefix: **<@${client.user.id}>***`)
				.addField(`\`sourceCode\``, `> Directly messages a link to the bot's Github page to the command author.\n> **Aliases**: \`source\`\n> ex. \<@${client.user.id}> sourceCode`)
				.addField(`\`talentSearch\``, `> Checks for multiple talents, seperated by commas, in the database.\n> **Aliases**: \`ts\`, \`talents\`\n> ex. <@${client.user.id}> ts <talent one>, <talent two>, etc...`)
				.addField(`\`talentsInbetween\` *whitelisted command*`, `> Checks for all talents inbetween two known talents. Can also filter by specific talent rank.\n> **Aliases**: \`tib\`\n> ex. <@${client.user.id}> tib spell proof, spell defying, rare`)
				.addField(``)
				//.addField(`\`reagentSearch\``, `> Buggy. Posts wiki link for reagent and looks for reagent locations and posts them to discord.\n> Aliases: \`regsearch\`, \`regs\`\n> <@782434037179613195> ts <talent one>, <talent two>, etc...`)

		message.channel.send(helpEmbed);

		CommandLog.logCommand(client, message, message.guild.id, "help");
      	}
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function beginnersGuide(client, message, args) {
	let beginnersGuideEmbed = new Discord.MessageEmbed()
		.setColor("#310ff5")
		.setDescription(`I. . . . . Introduction\nII. . . . . . Our Mission\nIII. . . . . . . What is a Genome?\nIV. . . . . . . . . What is Talent Priority?\nV. . . . . . . . . . . What are Relationships?\nVI. . . . . . . . . . . . Our Data Threads\nVII. . . . . . . . . . . . . How to Contribute\nVIII. . . . . . . . . . . . . . Glossary\nIX. . . . . . . . . . . . . . . . . Conclusion`)
		.addField(`__I. Introduction__`, `In this guide, you’ll learn the ropes about our project, threads, and contribution processes. You'll also be introduced to the concept of talent priority: an in-game mechanic that determines where any talent may be placed in a pet's genome. Links to other threads will be provided throughout this they become relevant; you won't be required to read through them, but they're worth checking out if you have the time.\n\nWithout further ado, let’s get started!`)
}

async function quickLinks(client, message) {
	message.channel.send("http://www.wizard101central.com/forums/showthread.php?506222-The-Project-O-Workbooks")
}

async function mainPage(client, message) {
	const mainPageEmbed = new Discord.MessageEmbed()
		.setColor("#310ff5")
		.setTitle(`${Emojis.intellect.pub} Welcome to the Talent Lookup bot ${Emojis.intellect.pub}`)
		.setDescription()
		.addField()
}