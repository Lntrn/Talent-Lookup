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
			name: "fullTalentList",
			aliases: ["talentlist"],
			description: "",
			usage: "",
			id: "",
        async execute(client, message, args) {
            
            if(message.member.hasPermission(["MANAGE_MESSAGES", "ADMINISTRATOR"])) {
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
                
                let sheet = doc.sheetsByIndex[0];
                await sheet.loadCells('A1:C');

			    let sentMessage = message.channel.send("connecting to database, please wait");

			    // Go to next function || Line 60
			    getData(client, message, args, sheet, sentMessage);
			
			    // Log the command
			    CommandLog.logCommand(client, message, message.guild.id, "full List");
            } else {
				return message.channel.send("You do not have permission to use this command.")
			}

		}		
};

//Function to automaically capitalise first letters of words
function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

async function getData(client, message, args, sheet, sentMessage) {

	let talentList = [];
	
	let maxRow = sheet.cellStats.nonEmpty/3;

    for (let row = 0; row < maxRow; row++) {
        // Finds each talent's name
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
        
        let data = {
			"name": name,
			"minWeight": weightArray[0],
			"maxWeight": weightArray[1].replace("!", ""),
			"rank": rank,
			"row": row,
        }
        talentList.push(data);
    }

	sendData(client, message, talentList);
}

async function sendData(client, message, talentList) {

	let descArray = [];
	for (talent of talentList) {    

        let cappedName;
        let cappedRank = talent.rank.split(" ").map(capitalize).join(" ");
        if (talent.name.includes("-")) {
            cappedName = talent.name.split("-").map(capitalize).join("-");
        } else {
            cappedName = talent.name.split(" ").map(capitalize).join(" ");
        }

        if (cappedName.includes("(battle")) {
            cappedName = cappedName.replace("(battle", "(Battle")
        }
        
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

        let desc = `> \`${talent.minWeight} - ${talent.maxWeight}\` \`${rankFirstChars}\` **${cappedName}**`;
        
		descArray.push(desc);

    }
    
	let talentDesc = descArray.join("\n");

	message.channel.send(talentDesc, { split: true }).then(message.react(Emojis.intellect.id)).catch((error) => message.channel.send(error));

}

