const fs = require("fs");
const csv=require('csvtojson');
require('dotenv-flow');

const Channels = require("../utilities/channels.js");
const Config = JSON.parse(fs.readFileSync('./utilities/config.json', 'utf8'));
const CommandLog = require("../utilities/commandLog.js");
const Format = require("../utilities/format.js");
const Discord = require("discord.js");
const Emojis = require("../utilities/emojis.js");

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
const { xml } = require("cheerio");

module.exports = {
			name: "temp",
			aliases: ["tem"],
			description: "",
			usage: "",
			id: "",
		async execute(client, message, args) {

            class fullTalentList{
                set Order(Order){
                    this.order = Order;
                }
                set Name(Name){
                    this.name = Name;
                }
                get Order(){
                    return this.order;
                }
                get Name(){
                    return this.name;
                }
                constructor(){
                }
            }

            let fullTalentArray = []; // Array to store the full talent list

            // Invoking csv returns a promise
            const converter = csv()
            .fromFile("./priorities/talents.csv")
            .then((converted) => {
                let t;// Will be an Employee Object
                converted.forEach((row) => {
                    t = new fullTalentList();// New fullTalentList Object
                    Object.assign(t, row);// Assign json to the new Employee
                    fullTalentArray.push(t);// Add the Employee to the Array
                })});

			// Spreadsheet ID || In between the /d/ and /edit in the spreadsheet's URL
			// https://docs.google.com/spreadsheets/d/1pXHrhP__pWBkV4DBazMVlad4cv51hjJPq-es4EzQgw0/edit#gid=0
			const doc = new GoogleSpreadsheet("1pXHrhP__pWBkV4DBazMVlad4cv51hjJPq-es4EzQgw0");
                console.log(fullTalentArray)
			// Login to Google's server
    		await doc.useServiceAccountAuth({
				client_email: process.env.CLIENT_EMAIL,
				private_key: process.env.PRIVATE_KEY.replace(/\\n/gm, '\n'),
			});

			// Load the spread sheet
			await doc.loadInfo();
            let sheet = doc.sheetsByIndex[0];

			message.channel.send("connecting, please wait");

            await sheet.loadCells('B1:C');

            let talname;
            let talrank;
            let sheetList = [];

            let half = sheet.cellStats.nonEmpty/2
            //console.log(half)
            //console.log(fullTalentArray.length)

            for (let v = 0; v < half; v++) {
		
                // Finds each talent, "v" increasing means down one row in the spreadsheet
                nameCell = await sheet.getCell(v, 1);
                rankCell = await sheet.getCell(v, 2);

                talname = nameCell.value;
                talrank = rankCell.value;
        
                //console.log(talnameValue)

		        let rank = talrank.charAt(0);

		        if (rank === "1") {
		            rank = "Common";
		        } else if (rank === "2") {
		        rank = "Uncommon";
		        } else if (rank === "3") {
		            rank = "Rare";
		        } else if (rank === "4") {
		            rank = "Ultra-Rare";
		        } else if (rank === "5") {
		            rank = "Epic";
		        } 
        
                let forURL = talname.split(" ").map(capitalize).join("_");
        
                if (talname.includes("-")) {
                    forURL = talname.split("-").map(capitalize).join("-");
                }

                //console.log(talent)
                let talent = {
                    name: talname,
                    rank: rank,
                    url: `http://www.wizard101central.com/wiki/PetAbility:${forURL}`
                }
                sheetList.push(talent);
    
                // Add "data" to the array
                    
            }
            //let d = 0;
            //let a = 0;
            //let p = 0;
            //console.log(fullTalentArray)
            //console.log(fullTalentArray.length + " - full list")
            //console.log(sheetList.length + " - sheet list")

            let array1 = [];// ['a', 'b', 'c', 'd', 'e'];
            let array2 = [];// ['b', 'd', 'f'];

            array2 = array2.filter(function(item) {
                return !array1.includes(item) ? true : false;
            });

            console.log(array1); // [ 'a', 'b', 'c', 'd', 'e' ]
            console.log(array2); // [ 'f' ]
            let filteredArray = fullTalentArray.filter(function(item) {
                return !sheetList.includes(item); 
            })
            console.log(array1.length)
            console.log(array2.length)
            let tempArray = [];
            for (talent of fullTalentArray) {
                let order = parseInt(talent.order);
                console.log(order)
                for (i = 0; i < sheetList.length; i++) {
                    if (talent.name === sheetList[i].name) {
                        let newTalent = {
                            order: order,
                            name: sheetList[i].name,
                            rank: sheetList[i].rank,
                            url: sheetList[i].url,
                            score: 0,
                            emoji: "",
                            flags: [],
                            school: "",
                        }
                        tempArray.push(newTalent)
                    }
                }
            }
            console.log(tempArray.length)

            /*
{
    "order": 3,
    "name": "",
    "rank": "",
    "url": "",
    "score": 0,
    "emoji": ""
    "flags": [],
    "school": "",
  },
            */

            fs.writeFile ("./priorities/wiztalents.json", JSON.stringify(tempArray, null, 2), function(err) {
                if (err) {
                    console.log(err)
                }
                console.log('complete');
            });

            /*for (talent of fullTalentArray) {
                sheetList.some(sheetVal => { if (talent = sheetVal) {
                        console.log(d + " -d")
                        d++;
                    }
                console.log(a + " -a")
                a++
                })
            console.log(p + " -p")
            p++
            }*/
            
            

			// Log the command
			CommandLog.logCommand(client, message, message.guild.id, "temp command");
		}
};
//Function to automaically capitalise first letters of words
function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
