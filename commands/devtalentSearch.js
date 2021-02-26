const csv=require('csvtojson')

const fs = require("fs");

const Channels = require("../utilities/channels.js");
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));
const CommandLog = require("../utilities/commandLog.js");
const Format = require("../utilities/format.js");
const Discord = require("discord.js");
const Emojis = require("../utilities/emojis.js");

module.exports = {
			name: "devtalentSearch",
			aliases: ["devts"],
			description: "",
			id: "",
	    async execute(client, message, args) {

			if (message.author.id !== Config.ownerID) {
				return message.channel.send("no access");
			}

            class fullTalentList{
                set Priority(Priority){
                    this._Priority = Priority;
                }
                set Name(Name){
                    this._Name = Name;
                }
                get Priority(){
                    return this._Priority;
                }
                get Name(){
                    return this._Name;
                }
                constructor(){
                }
            }

            let fullTalentArray = [];// Array to store Employee Objects

            // Invoking csv returns a promise
            const converter = csv()
            .fromFile("./priorities/talents.csv")
            .then((converted) => {
                let t;// Will be an Employee Object
                converted.forEach((row) => {
                    t = new fullTalentList();// New Employee Object
                    Object.assign(t, row);// Assign json to the new Employee
                    fullTalentArray.push(t);// Add the Employee to the Array
                })});

			prepareArgs(client, message, args, fullTalentArray);

			// Log command
			CommandLog.logCommand(client, message, message.guild.id, "talent search");
      	}
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function prepareArgs(client, message, args, fullTalentArray) {

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
		console.log(trimmed)

		// If "trimmed" does not exist, send missing talents message
		if (trimmed.length !== 0) {
			// Adding
			talentArray[p] = trimmed;
			// Moving to the next talent in the array
			p++;
		} else {
			// missing talents message
			message.channel.send(`error: ${trimmed}`);
		}
	}

	findTalents(client, message, args, fullTalentArray, talentArray, totalCount);
	getWeights(client, message, doc, sheet, listArray, totalCount);
	getRanks(client, message, doc, sheet, weights, totalCount);
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
		
		searchEmbed.setFooter(`Returned ${dataArray.length} talents`);
		message.channel.send(searchEmbed);
	}

			
}

