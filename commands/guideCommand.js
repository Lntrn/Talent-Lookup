const fs = require("fs");

const Channels = require("../utilities/channels.js");
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));
const CommandLog = require("../utilities/commandLog.js");
const Format = require("../utilities/format.js");
const Discord = require("discord.js");
const Emojis = require("../utilities/emojis.js");

module.exports = {
			name: "guideCommand",
			aliases: ["guide"],
			description: "",
			id: "",
	async execute(client, message, args) {

		let page = 1;

		const sentEmbed = await message.channel.send(mainPage(client, message));

		sentEmbed.react("⏪");
        sentEmbed.react("⏩");

		// Create reaction filters
		const leftFilter = (reaction, user) => reaction.emoji.name === "⏪" && user.id === message.author.id;
        const rightFilter = (reaction, user) => reaction.emoji.name === "⏩" && user.id === message.author.id;

		// Create reaction collections, timeout after 60000 ms, 60 seconds
		const leftCollector = sentEmbed.createReactionCollector(leftFilter, {time: 300000});
        const rightCollector = sentEmbed.createReactionCollector(rightFilter, {time: 300000});

		leftCollector.on("collect",
            function() {
                sentEmbed.reactions.cache.get("⏪").users.remove(message.author);
				resetTimer(leftCollector, rightCollector);
				
				switch(page) {
					case 1:
						break;
					case 2: 
						sentEmbed.edit(mainPage(client, message));
						page--;
						break;
					case 3:
						sentEmbed.edit(pageTwo(client, message));
						page--;
						break;
					case 4: 
						sentEmbed.edit(pageThree(client, message));
						page--;
						break;
					case 5:
						sentEmbed.edit(pageFour(client, message));
						page--;
					default:
						console.log(page);
				}

            }
        );

        rightCollector.on("collect",
            function() {
                sentEmbed.reactions.cache.get("⏩").users.remove(message.author);
				resetTimer(leftCollector, rightCollector);
				
				switch(page) {
					case 1:
						sentEmbed.edit(pageTwo(client, message));
						page++;
						break;
					case 2: 
						sentEmbed.edit(pageThree(client, message));
						page++;
						break;
					case 3: 
						sentEmbed.edit(pageFour(client, message));
						page++;
						break;
					case 4:
						sentEmbed.edit(pageFive(client, message));
						page++;
						break;
					case 5: 
						break;
					default:
						console.log(page);
				}
            }
        );


		// Log command
		CommandLog.logCommand(client, message, message.guild.id, "help");
    }
};

function resetTimer(left, right) {
    left.resetTimer({time: 60000});
    right.resetTimer({time: 60000});
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function quickLinks(client, message) {
	message.channel.send("http://www.wizard101central.com/forums/showthread.php?506222-The-Project-O-Workbooks")
}

function mainPage(client, message) {
	const mainPageEmbed = new Discord.MessageEmbed()
		.setColor("#310ff5")
		.setTitle(`${Emojis.intellect.pub} Welcome to the Talent Lookup bot ${Emojis.intellect.pub}`)
		.setDescription(`This guide is almost completely copied from [**Project O's Beginner's Pet Guide**](http://www.wizard101central.com/forums/showthread.php?486420-Beginner-s-Guide-to-Project-O). You need a basic understanding of this to use this bot.\n\nI'd also like to give a huge thanks to [Milt](http://www.wizard101central.com/forums/member.php?36-Milt) for being the one to originally type this guide up and maintaining Project O for so long.`)
		.setFooter(`Currently on page 1 of 5.`)
	
	return mainPageEmbed;
}

function pageTwo(client, message) {
	let pageTwoEmbed = new Discord.MessageEmbed()
		.setColor("#310ff5")
		.setTitle("__Table of Contents__")
		.setDescription(`I. . . . . Introduction\nII. . . . . . Our Mission\nIII. . . . . . . What is a Genome?\nIV. . . . . . . . . What is Talent Priority?\nV. . . . . . . . . . . What are Relationships?`)
		.addField(`__I. Introduction__`, `In this guide, you’ll learn the ropes about our project, threads, and contribution processes. You'll also be introduced to the concept of talent priority: an in-game mechanic that determines where any talent may be placed in a pet's genome. Links to other threads will be provided throughout this they become relevant; you won't be required to read through them, but they're worth checking out if you have the time.\n\nWithout further ado, let’s get started!`)
		.addField(`__II. Project O's Mission__`, "Project O was originally founded on June 27th, 2011, by PunkyMax. From the beginning, they positioned themselves as the central hub for researching talent-order mechanics and genome-reading techniques. Their work also paved the way towards the genome calculator: a technological marvel that deciphers pet genomes. This calculator was once considered a pipe dream up until the late 2010s and finally became a viable alternative to old-school genome-reading techniques by late 2020. They have worked alongside the Wizard101 Central Wiki to provide the highest quality knowledge base for the pet-hatching community.")
		.setFooter(`Currently on page 2 of 5.`)

	return pageTwoEmbed;
}

function pageThree(client, message) {
	let pageThreeEmbed = new Discord.MessageEmbed()
		.setColor("#310ff5")
		.setTitle(`__III. What is a Genome?__`)
		.setDescription(`A **genome** is simply a set of 10 talents. All pets have two genomes: one for talents and one for derby abilities. For simplicity's sake, both talents and derby abilities will be collectively referred to as "talents".\n\nYou might be forgiven for thinking that all talents within a genome are random, but thankfully this isn't really the case. **1st-gen pets** -- pets received via any method other than hatching (e.g. boss drops, Crowns Shop, hoard packs, etc.) -- share the exact same set of talents depending on their base species. So all [1st-gen Firecats](http://www.wizard101central.com/wiki/Pet:Firecat) share the same genome, all [1st-gen Fennec Foxes](http://www.wizard101central.com/wiki/Pet:Fennec_Fox) share the same genome, and so on. The Wizard101 Wiki is the go-to resource for most pets' 1st-gen genomes. 1st-gen pets are also extremely valuable to Project O, especially if they’re difficult to get outside of hatching (e.g. [Frostbound Grimhorn](http://www.wizard101central.com/wiki/Pet:Frostbound_Grimhorn)).\n\nPets received via hatching on the other hand inherit their talents through both of their parents barring a couple exceptions like [Pip Boost](http://www.wizard101central.com/wiki/PetAbility:Pip_Boost#axzz6UMwesI7G) and [Sunbird Call](http://www.wizard101central.com/wiki/PetAbility:Sunbird_Call#axzz6UMwUZHET).`)
		.setFooter(`Currently on page 3 of 5.`)
	
	return pageThreeEmbed;
}

function pageFour(client, message) {
	let pageFourEmbed = new Discord.MessageEmbed()
		.setColor("#310ff5")
		.setTitle(`__IV. What is Talent Priority?__`)
		.setDescription(`Every single talent in the game has a unique hidden number tied to it called **priority** -- the official term used by KingsIsle, by the way. These hidden priority values are how the game determines which talents are placed into each slot. Talents with lower priority values are placed toward the genome's upper slots, while talents with higher priority values are placed toward the genome's lower slots.\n\nAs an example, have you ever noticed how in pets whose genomes contain both [Spell-Proof](http://www.wizard101central.com/wiki/PetAbility:Spell-Proof) and [Spell-Defying](http://www.wizard101central.com/wiki/PetAbility:Spell-Defying), [Spell-Proof](http://www.wizard101central.com/wiki/PetAbility:Spell-Proof) always seems to appear above [Spell-Defying](http://www.wizard101central.com/wiki/PetAbility:Spell-Defying)?\n\nThis observation isn't just a mere coincidence: it's the direct result of Spell-Proof having a lower priority value than Spell-Defying. This same principle extends to all other talents from Furnace to Balance-Sniper.\n\nSadly, the exact priority values for all those talents aren't known to us – they’re buried deep within the game’s source code after all. Instead, we have to recreate those numbers from scratch by documenting how each talent relates to one another across countless genomes, the data for which can be found in our [databases](http://www.wizard101central.com/forums/showthread.php?497749-Project-O-s-Data) or using this bot.`)
		.setImage("https://i.imgur.com/fR9Xa9Z.jpg")
		.setFooter(`Currently on page 4 of 5.`)

	return pageFourEmbed;
}

function pageFive(client, message) {
	let pageFiveEmbed = new Discord.MessageEmbed()
		.setColor("#310ff5")
		.setTitle(`__V. What are Relationships?__`)
		.setDescription(`A **relationship** describes how two talents are known to be ordered in-game. For now, you only need to be familiar with two categories: ranked relationships and unranked relationships. A relationship between two talents is considered **ranked** when it is currently known. For example [Spell-Proof](http://www.wizard101central.com/wiki/PetAbility:Spell-Proof), and [Spell-Defying](http://www.wizard101central.com/wiki/PetAbility:Spell-Defying) have a ranked relationship because [Spell-Proof](http://www.wizard101central.com/wiki/PetAbility:Spell-Proof) is above [Spell-Defying](http://www.wizard101central.com/wiki/PetAbility:Spell-Defying) (and vice versa). Meanwhile, a relationship between two talents is considered **unranked** when it is currently unknown, meaning we don't know which talent is above or below the other. The vast majority of relationships are ranked as seen from our data -- it's the remaining handful of unranked ones that Project O really cares about.\n\nAt this stage, the only terms you really need to remember are above, below, and unranked. They're the most common. But this is only the tip of the iceberg. There are many more relationship types below the surface, many of which so technically precise that they fall outside the scope of this guide.\n\n(Fun Fact: Project O's official definitions for "above" and "below" are so precise that they're technically not opposites of each other.)`)
		.setFooter(`Currently on page 5 of 5.`)

	return pageFiveEmbed;
}