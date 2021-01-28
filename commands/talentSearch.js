const fs = require("fs");

const Channels = require("../utilities/channels.js");
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));
const CommandLog = require("../utilities/commandLog.js");
const Format = require("../utilities/format.js");
const Discord = require("discord.js");
const Emojis = require("../utilities/emojis.js");

const Secret = require("../utilities/sheetCredentials.json");

const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
			name: "talentSearch",
			aliases: ["ts"],
			description: "Checks for multiple talents in the database.",
			usage: "<talent one>, <talent two>, etc...",
			id: "7992",
		async execute(client, message, args) {

			// Spreadsheet ID || In between the /d/ and /edit in the spreadsheet's URL
			// https://docs.google.com/spreadsheets/d/1pXHrhP__pWBkV4DBazMVlad4cv51hjJPq-es4EzQgw0/edit#gid=0
			const doc = new GoogleSpreadsheet("1pXHrhP__pWBkV4DBazMVlad4cv51hjJPq-es4EzQgw0");

			// Login to Google's server
    		await doc.useServiceAccountAuth({
				client_email: Secret.client_email,
				private_key: Secret.private_key,
			});

			// Load the spread sheet
			await doc.loadInfo();

			message.channel.send("connecting to database, please wait");

			// Go to next function || Line 47
			prepareArgs(client, message, args, doc);
			
			// Log the command
			CommandLog.logCommand(client, message, message.guild.id, "talent Search");
		}
};

//Function to automaically capitalise first letters of words
function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// Preparing the arguments for use
async function prepareArgs(client, message, args, doc) {

	// Joining the arguments in to one long string
	let argsStr = args.join(" ");
	// Making the entire string lower case
	let talents = argsStr.toLowerCase();
	// Splitting the string at each comma to get talent names
	let argsArray = talents.split(",");

	// Creating talentArray for later use
	let talentArray = [];

	// Saving the total amount of requested talents
	let totalCount = argsArray.length;

	// Used in adding each talent to an array || Line 75
	let p = 0;
	
	// Looping over each talent in the argsArray || Line 49
	for (talent of argsArray) {
			
		// Removing spaces at the start and end of each talent
		let trimmed = talent.trim();

		// Replacing dashes and undersoces with spaces
		if (trimmed.includes("-") || trimmed.includes("_")) {
			trimmed = trimmed.replace("-", " ");
			//trimmed = trimmed.replace("_", " ");
		} 

		// Substring of talents that need dashes in their name
		let array = ["boon", "bringer", "giver", "dealer", "shot", "eye", "sniper", "away", "defy", "off", "it", "proof", "ward", "storm tooth", "power taker", "quick witted"];
		let exceptions = ["evil eye", "curse giver", "keen eyes", "evil eye", "ward wrecker", "steal ward", "clean ward", "biting cold", "critical hitter", "critical striker", "drop it", "spirit armor", "spirit blade", "spirit shield", "sprite queen", "sprite time", "stun recalcitrant"]
		// Checking to see if any of the arguments contain a variable in the above array
		if (array.some(v => trimmed.includes(v))) {
			trimmed = trimmed.replace(" ", "-");
		} 
		if (exceptions.some(v => v === trimmed.replace("-", " "))) {
			trimmed = trimmed.replace("-", " ");
		}
		if (trimmed.includes("unlocked")) {
			trimmed = trimmed.replace("unlocked", "{_}");
		}
		if (trimmed.includes("locked")) {
			trimmed = trimmed.replace("locked", "{#}");
		}

		// If "trimmed" does not exist, send missing talents message
		if (trimmed.length !== 0) {
			// Adding
			talentArray[p] = trimmed;
			// Moving to the next talent in the array
			p++;
		} else {
			// missing talents message
			message.channel.send(`error:  ${trimmed}`);
		}
	}

	findTalents(client, message, args, doc, talentArray, totalCount);
}

async function findTalents(client, message, args, doc, talentArray, totalCount) {
	// Picks the first sheet in the spreadsheet file
	let sheet = doc.sheetsByIndex[0];
	// Used in adding each talent to an array || Line 123
	let a = 0;
	// Load the cells required for this function
	await sheet.loadCells('B1:B');

	// Create things for future use
	let listArray = [];
	let tal;
	let value;

	// Loop to search the spreadsheet for matching talent names
	for (let v = 0; v < sheet.cellStats.nonEmpty; v++) {
		
		// Finds each talent, "v" increasing means down one row in the spreadsheet
		tal = await sheet.getCell(v, 1);
		//console.log(tal.value)

		value = tal.value.toLowerCase();

		// If a cell's value matches, save it's value and row number
		if (talentArray.some(t => value.includes(t))) {


			let forURL = value.split(" ").map(capitalize).join("_");

			if (value.includes("-")) {
				forURL = value.split("-").map(capitalize).join("-");
			}

			let data = {
				"name": value,
				"row": v,
				"url": `http://www.wizard101central.com/wiki/PetAbility:${forURL}`
			}
			// Add "data" to the array
			listArray[a] = data;
			a++;
		}
	}
	  
	getWeights(client, message, doc, sheet, listArray, totalCount);
}

async function getWeights(client, message, doc, sheet, listArray, totalCount) {
	await sheet.loadCells('A1:A');

	let weights = [];

	for (let g = 0; g < listArray.length; g++) {
		let weight = await sheet.getCell(listArray[g].row, 0);

		let weightArray = weight.value.split("-");

		let data = {
			"name": listArray[g].name,
			"minWeight": weightArray[0],
			"maxWeight": weightArray[1].replace("!", ""),
			"row": listArray[g].row,
			"url": listArray[g].url
		}
		weights[g] = data;
	}

	//console.log(weights)

	getRanks(client, message, doc, sheet, weights, totalCount);
}

async function getRanks(client, message, doc, sheet, weights, totalCount) {
	await sheet.loadCells('C1:C');

	let dataArray = [];

	console.log(weights.length)
	for (let g = 0; g < weights.length; g++) {
		tal = await sheet.getCell(weights[g].row, 2);

		let rank = tal.value.charAt(0);
		//console.log(rank)

		if (rank === "1") {
			rank = "common";
		} else if (rank === "2") {
			rank = "uncommon";
		} else if (rank === "3") {
			rank = "rare";
		} else if (rank === "4") {
			rank = "ultra rare";
		} else if (rank === "5") {
			rank = "epic";
		} 

		let data = {
			"name": weights[g].name,
			"minWeight": weights[g].minWeight,
			"maxWeight": weights[g].maxWeight,
			"rank": rank,
			"url": weights[g].url
		}
		dataArray[g] = data;
	}
	console.log("ranks")
	console.log(dataArray)
	sendData(client, message, doc, sheet, dataArray, totalCount);
}

async function sendData(client, message, doc, sheet, dataArray, totalCount) {

	let authorTag = message.author.tag;
	let authorAv = message.author.avatarURL();

	let searchEmbed = new Discord.MessageEmbed()
        .setTitle(authorTag)
        .setThumbnail(authorAv)
		.setColor("#310ff5")


	let embedDescArray = [];
	let secondArray = [];
	let cappedName;
	let cappedRank;
	let rankFirstChars;
	for (let k = 0; k < dataArray.length; k++) {

		if (dataArray[k].name.includes("-")) {
			dataArray[k].name = dataArray[k].name.replace("-", " ");
		}
		if (dataArray[k].name.includes("_"))  {
			dataArray[k].name = dataArray[k].name.replace("_", " ");
		}
		cappedName = dataArray[k].name.split(" ").map(capitalize).join(" ");
		cappedRank = dataArray[k].rank.split(" ").map(capitalize).join(" ");

		if (cappedName.includes("{#}")) {
			cappedName = cappedName.replace("{#}", "[Locked]")
		} else if (cappedName.includes("{ }")){
			cappedName = cappedName.replace("{ }", "[Unlocked]")
		}

		if (dataArray[k].rank === "uncommon") {
			rankFirstChars = "UC";
		} else if (dataArray[k].rank === "ultra rare"){
			rankFirstChars = "UR";
		} else {
			rankFirstChars = `${cappedRank.charAt(0)} `;
		}
		rankFirstChar = cappedRank.charAt(0)
		embedDescArray[k] = `\`${dataArray[k].minWeight} - ${dataArray[k].maxWeight}\` \`${rankFirstChars}\` [${cappedName}](${dataArray[k].url})`;
		secondArray[k] = `> \`${dataArray[k].minWeight} - ${dataArray[k].maxWeight}\` \`${rankFirstChars}\` **${cappedName}**`;
	}

	let talentDesc = embedDescArray.join("\n");

	if (talentDesc.length > 4000) {
		secondArray.unshift("~~~~~ start ~~~~~");
		secondArray.push("~~~~~ end ~~~~~");
		talentDesc = secondArray.join("\n");
		message.author.send(talentDesc, { split: true }).then(message.react(Emojis.intellect.id)).catch((error) => message.channel.send(`Turn on your dms ${message.author}`));
	} else {

		// If the first array was over  2048 characters, split it up. Max 25 fields per embed
		let [part1, ...part2] = Discord.splitMessage(talentDesc, { maxLength: 2048 });

    	// Max characters were not reached so there is no "rest" in the array
    	if (part2.length !== 0) { 
			console.log("part2")
			searchEmbed.setDescription(part1);
			let part2Joined = part2.join("\n");
			let [part2cont, ...part3] = Discord.splitMessage(part2Joined, { maxLength: 1024 });
			searchEmbed.addField("ˡᵒᵗˢ ᵒᶠ ᵗᵃˡᵉⁿᵗˢ ʰᵘʰ", part2cont);

			if (part3.length !== 0) {
				console.log("part3")
		
				let part3Joined = part3.join("\n");

				let [part3cont, ...part4] = Discord.splitMessage(part3Joined, { maxLength: 1024 });
				searchEmbed.addField("ˡᵒᵗˢ ᵒᶠ ᵗᵃˡᵉⁿᵗˢ ʰᵘʰ", part3cont);
				if (part4.length !== 0) {
					console.log("part4")

					let part4Joined = part4.join("\n");

					let [part4cont, ...part5] = Discord.splitMessage(part2Joined, { maxLength: 1024 });
					searchEmbed.addField("ˡᵒᵗˢ ᵒᶠ ᵗᵃˡᵉⁿᵗˢ ʰᵘʰ", part4cont);
					if (part5.length !== 0) {
						console.log("part5")

						let part5Joined = part5.join("\n");
						searchEmbed.addField("ˡᵒᵗˢ ᵒᶠ ᵗᵃˡᵉⁿᵗˢ ʰᵘʰ", part5Joined);
						//let [part4cont, ...part5] = Discord.splitMessage(part2Joined, { maxLength: 1024 });
					}
				}
			}
		} else {
			searchEmbed.setDescription(talentDesc);
		}
	}

	searchEmbed.setDescription(talentDesc);
	searchEmbed.setFooter(`Returned ${dataArray.length} talents`);
	message.channel.send(searchEmbed);
			
}

async function spacer(message, client, args) {

	let alphabetMap = new Map()
		alphabetMap["a"] = "10"
		alphabetMap["b"] = "10"
		alphabetMap["c"] = "10"
		alphabetMap["d"] = "10"
		alphabetMap["e"] = "10"
		alphabetMap["f"] = ""
		alphabetMap["g"] = "10"
		alphabetMap["h"] = "10"
		alphabetMap["i"] = ""
		alphabetMap["j"] = "1"
		alphabetMap["k"] = "1"
		alphabetMap["l"] = "1"
		alphabetMap["m"] = "1"
		alphabetMap["n"] = "1"
		alphabetMap["o"] = "1"
		alphabetMap["p"] = "1"
		alphabetMap["q"] = "1"
		alphabetMap["r"] = "1"
		alphabetMap["s"] = "1"
		alphabetMap["t"] = "1"
		alphabetMap["u"] = "1"
		alphabetMap["v"] = "1"
		alphabetMap["w"] = "1"
		alphabetMap["x"] = ""
		alphabetMap["y"] = ""
		alphabetMap["z"] = ""
		
	let argsStr = args.join("");
	let letters = talents.split("");
	
	for (letter of letters) {

		if (letter.length !== 0) {

		}
	}
    
}