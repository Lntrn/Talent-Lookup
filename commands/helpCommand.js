const fs = require("fs");

const Channels = require("../utilities/channels.js");
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));
const CommandLog = require("../utilities/commandLog.js");
const Format = require("../utilities/format.js");
const Discord = require("discord.js");
const Emojis = require("../utilities/emojis.js");

module.exports = {
			name: "helpCommand",
			aliases: ["help", "ivefallenandcantgetup"],
			description: "",
			id: "5026",
	    async execute(client, message, args) {

			let page = "";

			const helpEmbed = new Discord.MessageEmbed()
				.setColor("#310ff5")
				.addField(` ‎`, `**Need help understanding the numbers beside each talent? Try \`t!guide\`**\n*Prefix: **t!**\nUniversal Prefix: **<@${client.user.id}>***`)
				.addField(`\`sourceCode\``, `> Directly messages a link to the bot's Github page to the command author.\n> **Aliases**: \`source\`\n> ex. \<@${client.user.id}> sourceCode`)
				.addField(`\`talentSearch\``, `> Checks for multiple talents, seperated by commas, in the database.\n> **Aliases**: \`ts\`, \`talents\`\n> ex. <@${client.user.id}> ts <talent one>, <talent two>, etc...`)
				.addField(`\`talentsInbetween\` *whitelisted command*`, `> Checks for all talents inbetween two known talents. Can also filter by specific talent rank. If you would like to request permission to use it you can dm <@750304052184612865>.\n> **Aliases**: \`tib\`\n> ex. <@${client.user.id}> tib spell proof, spell defying, rare`)
				.addField("MAX PET STATS (2.0)", `__**Strength**   ‎  ‎  ‎ ‎ ‎‎ ‎‎255__ ${Emojis.strength.pub}\n__**Intellect**   ‎  ‎  ‎ ‎  ‎ ‎ 250__ ${Emojis.intellect.pub}\n__**Agility‎**   ‎ ‎  ‎  ‎  ‎    ‎    ‎ ‎ ‎ 260__ ‎${Emojis.agility.pub}\n__**Will**   ‎ ‎ ‎   ‎  ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ 260__ ‎${Emojis.will.pub}\n__**Power‎**  ‎ ‎ ‎   ‎  ‎ ‎ ‎ ‎ ‎ ‎ ‎250__ ${Emojis.power.pub}\n__**Happiness**   ‎  ‎ 1275__ ${Emojis.happiness.pub}`, true)
				.addField("LEVEL XP REQUIREMENTS", `__**Teen**:    ‎    ‎ ‎     ‎  ‎  ‎ ‎ ‎ ‎  ‎ ‎ 125__   ${Emojis.wizxp.pub}\n__**Adult**:   ‎  ‎   ‎ ‎‎‎    ‎  ‎ ‎  ‎ ‎ 250__   ${Emojis.wizxp.pub}\n__**Ancient**:    ‎  ‎  ‎ ‎  ‎ 525__   ${Emojis.wizxp.pub}\n__**Epic**:    ‎  ‎  ‎ ‎    ‎  ‎  ‎ ‎  ‎ ‎   ‎ ‎ 1050__   ${Emojis.wizxp.pub}\n__**Mega**:    ‎  ‎     ‎   ‎ ‎  ‎ ‎  ‎ ‎ 2125__   ${Emojis.wizxp.pub}\n__**Ultra**:    ‎  ‎     ‎  ‎   ‎ ‎  ‎ ‎  ‎ ‎ 2250__   ${Emojis.wizxp.pub}`, true)
				.setFooter(Format.footer.desc, Format.footer.image)
				
			message.channel.send(helpEmbed);

			// Log command
			CommandLog.logCommand(client, message, message.guild.id, "help");
      	}
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

