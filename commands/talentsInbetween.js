const fs = require("fs");
require('dotenv-flow');

const Channels = require("../utilities/channels.js");
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));
const CommandLog = require("../utilities/commandLog.js");
const Format = require("../utilities/format.js");
const Discord = require("discord.js");
const Emojis = require("../utilities/emojis.js");

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { exception } = require("console");

module.exports = {
			name: "talentsInbetween",
			aliases: ["tib"],
			description: "Checks for a talents inbetween two known talents with URLs to each.",
			usage: "<talent one>, <talent two>, [if they put in a rank then filter by that rank, if not then show all inbetween]",
			id: "7992",
		async execute(client, message, args) {
	
			// Spreadsheet ID || In between the /d/ and /edit in the spreadsheet's URL
			// https://docs.google.com/spreadsheets/d/1pXHrhP__pWBkV4DBazMVlad4cv51hjJPq-es4EzQgw0/edit#gid=0
			const doc = new GoogleSpreadsheet("1pXHrhP__pWBkV4DBazMVlad4cv51hjJPq-es4EzQgw0");

			// Login to Google's server
    		await doc.useServiceAccountAuth({
				client_email: process.env.CLIENT_EMAIL,
				private_key: process.env.PRIVATE_KEY.replace(/\\n/gm, '\n'),
			});

			// Load the spread sheet
			await doc.loadInfo();

			message.channel.send("connecting to database, please wait");

			// Go to next function || Line 60
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
	let argsToLower = argsStr.toLowerCase();
	// Splitting the string at each comma to get talent names
	let argsArray = argsToLower.split(",");

	let j = 0;

	for (talent of argsArray) {

		// Removing spaces at the start and end of each talent
		let trimmed = talent.trim();

		// Replacing dashes and undersoces with spaces
		if (trimmed.includes("-") || trimmed.includes("_")) {
			trimmed = trimmed.replace("-", " ");
			trimmed = trimmed.replace("_", " ");
		}

		// Substring of talents that need dashes in their name
		let array = ["boon", "bringer", "giver", "dealer", "shot", "eye", "sniper", "away", "defy", "off", "it", "proof", "ward", "storm tooth", "power taker", "quick witted"];
		let exceptions = ["evil eye", "curse giver", "keen eyes", "evil eye", "ward wrecker", "steal ward", "clean ward", "biting cold", "critical hitter", "critical striker", "drop it", "spirit armor", "spirit blade", "spirit shield", "sprite queen", "sprite time", "stun recalcitrant"]
		// Checking to see if any of the arguments contain a variable in the above array
		if (array.some(v => trimmed.includes(v))) {
			trimmed = trimmed.replace(" ", "-");
			console.log(trimmed + " 1")
		} 
		if (exceptions.some(v => v === trimmed.replace("-", " "))) {
			trimmed = trimmed.replace("-", " ");
			console.log(trimmed + " 2")
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
			argsArray[j] = trimmed;
			j++;
		} else {
			// missing talents message
			message.channel.send(`error: ${trimmed}`);
		}
	}

    let potentialRank;
    let desiredRank;

    if (argsArray[2]) {
		potentialRank = argsArray[2].trim();
    } else {
        potentialRank = undefined;
	}
	
	const rankSet = new Set(["common", "uncommon", "rare", "ultra rare", "epic"]);

    if (rankSet.has(potentialRank)) {
        desiredRank = potentialRank;
        message.channel.send(`Looking for rank ${potentialRank}`);
    } else {
        desiredRank = undefined;
        message.channel.send("no rank provided");
    }
    
	// Go to next function || Line 116
	inputTalents(client, message, desiredRank, argsArray, doc);
}

// Finds the talents to search between
async function inputTalents(client, message, desiredRank, argsArray, doc) {

	console.log(argsArray)

	// Picks the first sheet
	let sheet = doc.sheetsByIndex[0];

	await sheet.loadCells('A1:C');
	let maxRow = sheet.cellStats.nonEmpty/3;

	// Create the talentList array
	let starterTalents = [];

	// Loop to search the spreadsheet for matching talent names
	for (let row = 0; row < maxRow; row++) {

		// Finds each talent's name and hyperlink, "v" increasing means down one row in the spreadsheet || This auto sorts the entire array for us * note to self
		let nameCell = await sheet.getCell(row, 1);
		let name = nameCell.value.toLowerCase();
		//console.log(name)
		let urlLetters = nameCell.hyperlink.split("");
		for (f = 0; f < urlLetters.length; f++) {
			//console.log(letter)
			if (urlLetters[f].includes(" ")) {
				urlLetters[f] = "_";
			}
		}
		let url = urlLetters.join("");

		// Finds each talent's weight
		let talWeight = await sheet.getCell(row, 0);
		let weightArray = talWeight.value.split("-");

		// Finds each talent's rank
		let talRank = await sheet.getCell(row, 2);
		let rank = talRank.value.charAt(0);

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

		// If a cell's value matches, save it's value and row number
		//console.log(row)
		if (argsArray.some(t => name === t)) {
			let data = {
				"name": name,
				"minWeight": weightArray[0],
				"maxWeight": weightArray[1].replace("!", ""),
				"rank": rank,
				"row": row,
				"url": url
			}
			// Add "data" to the array
			starterTalents.push(data);
		}
		
	} 
	//console.log(starterTalents)
	compareTalents(client, message, sheet, starterTalents, doc, desiredRank, argsArray);
}

async function compareTalents(client, message, sheet, starterTalents, doc, desiredRank, argsArray) {
	
	let oneRow;
	let twoRow;

	if (starterTalents[0] === undefined) {
		return message.channel.send(`Check spelling or talent not yet in database. \`${argsArray[0]}\``);
	} else if (starterTalents[1] === undefined) {
		return message.channel.send(`Check spelling or talent not yet in database. \`${argsArray[1]}\``);
	} else {
		oneRow = parseInt(starterTalents[0].row);
		twoRow = parseInt(starterTalents[1].row);
	}

	let talentList = []; 
	let talentsToFind = [];

	let maxRow = sheet.cellStats.nonEmpty/3;

	for (let row = 0; row < maxRow; row++) {
		
		// Finds each talent, "v" increasing means down one row in the spreadsheet
		let tal = await sheet.getCell(row, 0);
		let value = tal.value.toLowerCase();

		let talentWeight = value.split("-");

		let data = {
			"minWeight": talentWeight[0],
			"maxWeight": talentWeight[1].replace("!", ""),
			"row": row,
		}

		talentList.push(data);
	}
	// twoRow is bigger

	let talentCount = twoRow - oneRow;
	// Limit the query to 35 rows
	if (talentCount <= 35) {
		for (let d = 0; d < talentList.length; d++) {
			if (parseInt(talentList[d].row) > oneRow && parseInt(talentList[d].row) < twoRow) {
				let data = talentList[d].row
				talentsToFind.push(data);
			}
		}
	} else {

		let nextTalentRow = oneRow + 35;
		let nextTalentCell = await sheet.getCell(nextTalentRow, 1);
		let nextTalentName = nextTalentCell.value;
		console.log(nextTalentName)

		let emb = new Discord.MessageEmbed()
			.setTitle("Too large of range!")
			.setDescription(`The next talent you can search for is ${nextTalentName}`)

		message.channel.send(emb);
		return;
	}

	getMoreData(client, message, sheet, starterTalents, doc, desiredRank, talentsToFind);
}

async function getMoreData(client, message, sheet, starterTalents, doc, desiredRank, talentsToFind) {

	let foundTalents = [];

	let embed = new Discord.MessageEmbed()
		.setTitle(message.author.tag)
		.setThumbnail(message.author.avatarURL())
		.setColor("#310ff5")
		.setDescription(`Collecting data for ${talentsToFind.length} talents.`)

	for (row of talentsToFind) {

		// Finds each talent's name and hyperlink, "v" increasing means down one row in the spreadsheet || This auto sorts the entire array for us * note to self
		let nameCell = await sheet.getCell(row, 1);
		let name = nameCell.value.toLowerCase();
		console.log(name)

		let urlLetters = nameCell.hyperlink.split("");
		for (f = 0; f < urlLetters.length; f++) {
			//console.log(letter)
			if (urlLetters[f].includes(" ")) {
				urlLetters[f] = "_";
			}
		}
		//console.log(pain)	
		let url = urlLetters.join("");
		//console.log(url)

		// Finds each talent's weight
		let talWeight = await sheet.getCell(row, 0);
		let weightArray = talWeight.value.split("-");

		// Finds each talent's rank
		let talRank = await sheet.getCell(row, 2);
		let rank = talRank.value.charAt(0);

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
			"name": name,
			"minWeight": weightArray[0],
			"maxWeight": weightArray[1].replace("!", ""),
			"rank": rank,
			"row": row,
			"url": url
		}

		foundTalents.push(data);

	}
	//console.log(foundTalents.length)

	sendData(client, message, doc, sheet, desiredRank, foundTalents, starterTalents, embed);
}

async function sendData(client, message, doc, sheet, desiredRank, foundTalents, starterTalents, embed) {

	let t = 0;
	let embedDescArray = [];

	if (desiredRank !== undefined) {

		let cappedDesired = desiredRank.split(" ").map(capitalize).join(" ");

		let s = 0;

		for (talent of foundTalents) {

			let cappedName = talent.name.split(" ").map(capitalize).join(" ");
			let cappedRank = talent.rank.split(" ").map(capitalize).join(" ");
	
			let rankFirstChars;
	
			if (talent.rank === "uncommon") {
				rankFirstChars = "UC";
			} else if (talent.rank === "ultra rare") {
				rankFirstChars = "UR";
			} else {
				rankFirstChars = `${cappedRank.charAt(0)} `;
			}

			if (talent.rank === desiredRank) {
				desc = `> \`${talent.minWeight} - ${talent.maxWeight}\` \`${rankFirstChars}\` [${cappedName}](${talent.url})`;
				embedDescArray.push(desc);
				s++;
			}
			t++;

		}

		embed.setFooter(`Sent ${s} out of ${t} talents matching rank ${cappedDesired}`)

	} else {

		for (talent of foundTalents) {

			let cappedName = talent.name.split(" ").map(capitalize).join(" ");
			let cappedRank = talent.rank.split(" ").map(capitalize).join(" ");

			if (cappedName.includes("{#}")) {
				cappedName = cappedName.replace("{#}", "[Locked]")
			} else if (cappedName.includes("{_}")){
				cappedName = cappedName.replace("{_}", "[Unlocked]")
			}
	
			let rankFirstChars;
	
			if (talent.rank === "uncommon") {
				rankFirstChars = "UC";
			} else if (talent.rank === "ultra rare") {
				rankFirstChars = "UR";
			} else {
				rankFirstChars = `${cappedRank.charAt(0)} `;
			}

			let desc = `> \`${talent.minWeight} - ${talent.maxWeight}\` \`${rankFirstChars}\` [${cappedName}](${talent.url})`;

			embedDescArray.push(desc);
			t++;
			
		}

		embed.setFooter(`Returned ${t} talents`)

	}

	let cappedName1 = starterTalents[0].name.split(" ").map(capitalize).join(" ");
	let cappedName2 = starterTalents[1].name.split(" ").map(capitalize).join(" ");
	let cappedRank1 = starterTalents[0].rank.split(" ").map(capitalize).join(" ");
	let cappedRank2 = starterTalents[1].rank.split(" ").map(capitalize).join(" ");

	if (cappedName1.includes("unlocked")) {
		cappedName1 = cappedName1.replace("{_}", "unlocked");
	}
	if (cappedName1.includes("locked")) {
		cappedName1 = cappedName1.replace("{#}", "locked");
	}
	if (cappedName2.includes("unlocked")) {
		cappedName2 = cappedName2.replace("{_}", "unlocked");
	}
	if (cappedName2.includes("locked")) {
		cappedName2 = cappedName2.replace("{#}", "locked");
	}

	let rankFirstChars1;
	let rankFirstChars2;

	if (cappedRank1.rank === "Uncommon") {
		rankFirstChars1 = "UC";
	} else if (cappedRank1.rank === "Ultra Rare") {
		rankFirstChars1 = "UR";
	} else {
		rankFirstChars1 = `${cappedRank1.charAt(0)} `;
	}

	if (cappedRank2.rank === "Uncommon") {
		rankFirstChars2 = "UC";
	} else if (cappedRank2.rank === "Ultra Rare") {
		rankFirstChars2 = "UR";
	} else {
		rankFirstChars2 = `${cappedRank1.charAt(0)} `;
	}

	let talentOne = `\`${starterTalents[0].minWeight} - ${starterTalents[0].maxWeight}\` \`${rankFirstChars1}\` [${cappedName1}](${starterTalents[0].url})`;
	let talentTwo = `\`${starterTalents[1].minWeight} - ${starterTalents[1].maxWeight}\` \`${rankFirstChars2}\` [${cappedName2}](${starterTalents[1].url})`;

	embedDescArray.unshift(talentOne);
	embedDescArray.push(talentTwo);

	let talentDesc = embedDescArray.join("\n");
	if (talentDesc.length < 2048) {
		embed.setDescription(talentDesc);
	} else {
		let [part1, ...part2] = Discord.splitMessage(talentDesc, { maxLength: 2047 });
		embed.setDescription(part1);

        // Max characters were not reached so there is no "rest" in the array
         if (part2.length !== 0) { 
			let part2Joined = part2.join(" \n");
            //talentsEmbed.addField("ˡᵒᵗˢ ᵒᶠ ᵗᵃˡᵉⁿᵗˢ ʰᵘʰ", part2Joined)
            let [part2cont, ...part3] = Discord.splitMessage(part2Joined, { maxLength: 1023 });
            embed.addField("ˡᵒᵗˢ ᵒᶠ ᵗᵃˡᵉⁿᵗˢ ʰᵘʰ", part2cont);

            if (part3.length !== 0) {
                let part3Joined = part3.join(" \n");
                embed.addField("ˡᵒᵗˢ ᵒᶠ ᵗᵃˡᵉⁿᵗˢ ʰᵘʰ", part3Joined);
            }
        }
	}
	message.channel.send(embed)

}

