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
			name: "plainTIB",
			aliases: ["ptib"],
			description: "Checks for a talents inbetween two known talents and returns as plain text in chat. No limit but does not return the urls of each talent.",
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
			CommandLog.logCommand(client, message, message.guild.id, "ptib");
			

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
		if (trimmed.includes("unlocked")) {
			trimmed = trimmed.replace("unlocked", "{_}");
		}
		if (trimmed.includes("locked")) {
			trimmed = trimmed.replace("locked", "{#}");
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
		let url = nameCell.hyperlink.replace(" ", "_");

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
	for (let d = 0; d < talentList.length; d++) {
		if (parseInt(talentList[d].row) > oneRow && parseInt(talentList[d].row) < twoRow) {
			let data = talentList[d].row
            talentsToFind.push(data);
        }
	}

	getMoreData(client, message, sheet, starterTalents, doc, desiredRank, talentsToFind);
}

async function getMoreData(client, message, sheet, starterTalents, doc, desiredRank, talentsToFind) {

	let foundTalents = [];

	for (row of talentsToFind) {

		// Finds each talent's name and hyperlink, "v" increasing means down one row in the spreadsheet || This auto sorts the entire array for us * note to self
		let nameCell = await sheet.getCell(row, 1);
		let name = nameCell.value.toLowerCase();

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
        
        if (desiredRank === undefined) {
            let data = {
                "name": name,
                "minWeight": weightArray[0],
                "maxWeight": weightArray[1].replace("!", ""),
                "rank": rank,
                "row": row,
            }

            foundTalents.push(data);
        } else if (desiredRank === rank){
            let data = {
                "name": name,
                "minWeight": weightArray[0],
                "maxWeight": weightArray[1].replace("!", ""),
                "rank": rank,
                "row": row,
            }

            foundTalents.push(data);
        }
	}
	//console.log(foundTalents.length)

	sendData(client, message, doc, sheet, desiredRank, foundTalents, starterTalents);
}

async function sendData(client, message, doc, sheet, desiredRank, foundTalents, starterTalents) {

	let t = 0;
    let embedDescArray = [];

    for (talent of foundTalents) {

		let cappedName = talent.name.split(" ").map(capitalize).join(" ");
        let cappedRank = talent.rank.split(" ").map(capitalize).join(" ");
        
        if (cappedName.includes("{#}")) {
            cappedName = cappedName.replace("{#}", "[Locked]")
        } else if (cappedName.includes("{_}")) {
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

		let desc = `> \`${talent.minWeight} - ${talent.maxWeight}\` \`${rankFirstChars}\` **${cappedName}**`;

		embedDescArray.push(desc);
		t++;
			
    }

	let cappedName1 = starterTalents[0].name.split(" ").map(capitalize).join(" ");
	let cappedName2 = starterTalents[1].name.split(" ").map(capitalize).join(" ");
	let cappedRank1 = starterTalents[0].rank.split(" ").map(capitalize).join(" ");
	let cappedRank2 = starterTalents[1].rank.split(" ").map(capitalize).join(" ");
	
	if (cappedName1.includes("{_}")) {
		cappedName1 = cappedName1.replace("{_}", "[Unlocked]");
	}
	if (cappedName1.includes("{#}")) {
		cappedName1 = cappedName1.replace("{#}", "[Locked]");
	}
	if (cappedName2.includes("{_}")) {
		cappedName2 = cappedName2.replace("{_}", "[Unlocked]");
	}
	if (cappedName2.includes("{#}")) {
		cappedName2 = cappedName2.replace("{#}", "[Locked]");
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

	let talentOne = `\`${starterTalents[0].minWeight} - ${starterTalents[0].maxWeight}\` \`${rankFirstChars1}\` **${cappedName1}**`;
	let talentTwo = `\`${starterTalents[1].minWeight} - ${starterTalents[1].maxWeight}\` \`${rankFirstChars2}\` **${cappedName2}**`;

	embedDescArray.unshift(talentOne);
	embedDescArray.push(talentTwo);

    let talentDesc = embedDescArray.join("\n");

    let oneRow = parseInt(starterTalents[0].row);
	let twoRow = parseInt(starterTalents[1].row);
    let rowCount = twoRow - oneRow;
    
    if (rowCount > 50) {
        message.author.send(`Found ${embedDescArray.length - 2} talents, please wait.`);
        message.author.send(talentDesc, { split: true }).then(message.react(Emojis.intellect.id)).catch((error) => message.channel.send(`Turn on your dms ${message.author}`));
    } else {
        message.channel.send(`Found ${embedDescArray.length - 2} talents, please wait.`);
        message.channel.send(talentDesc, { split: true }).then(message.react(Emojis.intellect.id)).catch((error) => message.channel.send(`err`));
    }

}

