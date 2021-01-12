// require discord.js module
const Discord = require("discord.js");
const firebase = require("firebase-admin");
const dbSecret = require("../utilities/firebase.json");
const Emojis = require("../utilities/emojis.js");
// require channels.js module
const Channels = require("../utilities/channels.js");
// require format.js module
const Format = require("../utilities/format.js");
// require error logger module
const ErrorLog = require("../utilities/error.js");

module.exports = {
    name: "dbtalentInbetween",
    description: "Checks for a talents inbetween two known talents.",

    //<talent 1>, <talent two>, [if they put in a rank then filter by that rank, if not then show all inbetween]

    async searchFor(client, message, args) { 

        let db;

        if (firebase.apps.length === 0) {
            console.log("Initilizing Database");
            firebase.initializeApp({
              credential: firebase.credential.cert(dbSecret),
              databaseURL: "https://project_O.firebaseio.com" 
            });
            db = firebase.firestore();
        } else {
            db = firebase.firestore();
            console.log("DB already logged in.");
        }

        let argsStr = args.join(" ");
        let talents = argsStr.toLowerCase();
        let talentsArray = talents.split(",");

        //message.channel.send(talentsArray[0]);
        //message.channel.send(talentsArray[1]);
        //message.channel.send("~~~~~~~~~~");

        let talentOne = talentsArray[0];
        let talentTwo = talentsArray[1].trim();
        let potentialRank;
        let talentRank;

        if (talentsArray[2]) {
            potentialRank = talentsArray[2].trim();
        } else {
            potentialRank = undefined;
        }
    
        const rankSet = new Set(["common", "uncommon", "rare", "ultra rare", "epic"]);

        if (rankSet.has(potentialRank)) {
            talentRank = potentialRank;
            message.channel.send(`Looking for rank ${potentialRank}`);
        } else {
            talentRank = undefined;
            message.channel.send("no rank provided");
        }

        /*if (talentsArray.length === 3) {
            talentRank = talentsArray[2];
            //message.channel.send(talentRank);
        } else {
            talentRank = undefined;
            console.log("no rank provided");
        }*/

        message.channel.send("connecting to database, please wait");
        await new Promise((resolve) => {
            resolve(module.exports.talentOne(talentOne, talentTwo, talentRank, db, message));
          });

    }, 

    async talentOne(talentOne, talentTwo, talentRank, db, message) { 

        let talentDoc = db.collection("talents").doc(`${talentOne}`);
        let talentOneDoc = await talentDoc.get();

        try {
            if (talentOneDoc.get("name") === undefined) { 
                message.channel.send(`Check spelling or talent not yet in database. \`${talentOne}\``);
            } 
        } catch (err) {
            console.log(err);
        }

        await new Promise((resolve) => {
            resolve(module.exports.talentTwo(talentTwo, talentRank, db, message, talentOneDoc));
          });

    },
    
    async talentTwo(talentTwo, talentRank, db, message, talentOneDoc) { 

        let talentDoc = db.collection("talents").doc(`${talentTwo}`);
        let talentTwoDoc = await talentDoc.get();

        try {
            if (talentTwoDoc.get("name") === undefined) { 
                message.channel.send(`Check spelling or talent not yet in database. \`${talentTwo}\``);
            } 
        } catch (err) {
            console.log(err);
        }

        await new Promise((resolve) => {
            resolve(module.exports.compareTalents(talentRank, db, message, talentOneDoc, talentTwoDoc));
          });
    },

    async compareTalents(talentRank, db, message, talentOneDoc, talentTwoDoc) { 

        let oneMin = talentOneDoc.get("minWeight");
        let oneMax = talentOneDoc.get("maxWeight");

        let twoMin = talentTwoDoc.get("minWeight");
        let twoMax = talentTwoDoc.get("maxWeight");

        let talentsRef = db.collection("talents");
        let minWeightScreenshot;
        let maxWeightScreenshot;

        //
        // inverts for large ranges
        /*SAVE
        if (oneMin > twoMin) {// If oneMin is greater than twoMin
            minWeightScreenshot = await talentsRef.where("minWeight", "<=", `${oneMin}`).where("minWeight", ">=", `${twoMin}`).get();
        } else {
            minWeightScreenshot = await talentsRef.where("minWeight", ">=", `${oneMin}`).where("minWeight", "<=", `${twoMin}`).get();
        }

        if (oneMax > twoMax) {// If oneMax if greater than twoMax
            maxWeightScreenshot = await talentsRef.where("maxWeight", "<=", `${oneMax}`).where("maxWeight", ">=", `${twoMax}`).get();
        } else {
            maxWeightScreenshot = await talentsRef.where("maxWeight", ">=", `${oneMax}`).where("maxWeight", "<=", `${twoMax}`).get();
        }
        SAVE */

        let talentArray1 = [];
        let talentArray2 = [];

        //slightly different implementation - delete later

        var oneMinInt = parseInt(oneMin);
        var twoMinInt = parseInt(twoMin);
        var oneMaxInt = parseInt(oneMax);
        var twoMaxInt = parseInt(twoMax);

        if (oneMinInt <= twoMinInt) { // now twoMin always < oneMin
            let temp = oneMinInt;
            oneMinInt = twoMin;
            twoMinInt = temp;
        } 
        if (oneMaxInt <= twoMaxInt) { // now twoMax always < oneMax //these don't work lmaoooo
            let temp = oneMaxInt;
            oneMaxInt = twoMaxInt;
            twoMaxInt = temp;
        }
        
        let i = twoMinInt;

        while(i <= oneMinInt) {
            minWeightScreenshot = await talentsRef.where("minWeight", "==", `${i}`).get();// thistoo // I think?
            minWeightScreenshot.forEach(talent => {
                talentArray1.push(talent.get("name"));
            })
            i++; // i think this does it? // should we edit the bottom one t
        }

        i = twoMaxInt;

        while(i <= oneMaxInt){
            maxWeightScreenshot = await talentsRef.where("maxWeight", "==", `${i}`).get();
            maxWeightScreenshot.forEach(talent => {
                talentArray2.push(talent.get("name"));
            })
            i++;
        }
        
        //console.log(talentArray1);
        //console.log(talentArray2);

        let talentArray = talentArray1.filter(value => talentArray2.includes(value));

        let totalCount;
        let sentCount;

        let talent = [];
        let p = 0;

        let authorTag = message.author.tag;
        let authorAv = message.author.avatarURL();

        let talentsEmbed = new Discord.MessageEmbed()
            .setTitle(authorTag)
            .setThumbnail(authorAv)
            .setColor("#2399fa")

        if (talentRank !== undefined) {

            let requiredRank = talentRank.trim();

            let cappedRank;

            totalCount = 0;
            sentCount = 0;

            for (let talentName of talentArray) {
                let trimmedName = talentName.trim();
                //console.log(trimmedName);
                totalCount++;
                
                let talentDoc = db.collection("talents").doc(`${trimmedName}`);
                let queryTalent = await talentDoc.get();
          
                let name;
                let minWeight;
                let maxWeight;
                let rank;

          
                if (queryTalent.size === 0) { 
                    return message.channel.send(`check spelling or talent is not yet in db \`${trimmedName}\``);
                } else {
                    name = queryTalent.get("name");
                    minWeight = queryTalent.get("minWeight");
                    maxWeight = queryTalent.get("maxWeight");
                    rank = queryTalent.get("rank");
    
                    let cappedName = name.split(" ").map(capitalize).join(" ");
                    cappedRank = rank.split(" ").map(capitalize).join(" ");


                    //console.log(cappedRank.toLowerCase())
                    //console.log(requiredRank)
                    if (cappedRank.toLowerCase() === requiredRank) {
                        cappedRankAgain = cappedRank
                    } 
          
                    if (name === undefined || rank === undefined) {
                        message.channel.send(`check spelling or talent is not yet in db \`${trimmedName}\``);
                    } 

                    if (rank === requiredRank) {
                        talent[p] = `${cappedName}(${minWeight} - ${maxWeight}) // ${Emojis.powerPip.pub} **${cappedRank}**`;
                        sentCount++;
                        p++;
                    }
                    
                    
                }
             }

             let talentDesc = talent.join(" \n");

             talentsEmbed.setDescription(talentDesc);
             talentsEmbed.setFooter(`Sent ${sentCount} out of ${totalCount} talents matching rank ${cappedRankAgain}`);
             message.channel.send(talentsEmbed);

        } else {

            totalCount = 0;
            sentCount = 0;

            for (let talentName of talentArray) {
                let trimmedName = talentName.trim();
                //console.log(trimmedName);
                totalCount++;
                
                let talentDoc = db.collection("talents").doc(`${trimmedName}`);
                let queryTalent = await talentDoc.get();
          
                let name;
                let minWeight;
                let maxWeight;
                let rank;
                
                if (queryTalent.size === 0) { 
                    return message.channel.send(`check spelling or talent is not yet in db \`${trimmedName}\``);
                } else {
                    name = queryTalent.get("name");
                    minWeight = queryTalent.get("minWeight");
                    maxWeight = queryTalent.get("maxWeight");
                    rank = queryTalent.get("rank");
    
                    let cappedName = name.split(" ").map(capitalize).join(" ");
                    let cappedRank = rank.split(" ").map(capitalize).join(" ");
          
                    if (name === undefined) {
                        message.channel.send(`check spelling or talent is n ot yet in db \`${trimmedName}\``);
                    }
                    talent[p] = `${cappedName}(${minWeight} - ${maxWeight}) // ${Emojis.powerPip.pub} **${cappedRank}**`;
                    sentCount++;
                    p++;
                    
                }
             }

             //message.channel.send(`Sent ${sentCount} out of ${totalCount}.`);

             let talentDesc = talent.join(" \n");

             // Returns an array of strings
            let [part1, ...part2] = Discord.splitMessage(talentDesc, { maxLength: 2048 });

            // Max characters were not reached so there is no "rest" in the array
            if (part2.length !== 0) { 
                let part2Joined = part2.join(" \n");
                //talentsEmbed.addField("ˡᵒᵗˢ ᵒᶠ ᵗᵃˡᵉⁿᵗˢ ʰᵘʰ", part2Joined)
                let [part2cont, ...part3] = Discord.splitMessage(part2Joined, { maxLength: 2048 });
                talentsEmbed.addField("ˡᵒᵗˢ ᵒᶠ ᵗᵃˡᵉⁿᵗˢ ʰᵘʰ", part2cont);

                if (part3.length !== 0) {
                    let part3Joined = part3.join(" \n");
                    talentsEmbed.addField("ˡᵒᵗˢ ᵒᶠ ᵗᵃˡᵉⁿᵗˢ ʰᵘʰ", part3Joined);
                }
            } 

            /*// Get the other parts of the array with max char count
            for (const text of part2) {
             // Add new description to the base embed
                embed.setDescription(text)
                await message.channel.send(embed)
            }*/

             talentsEmbed.setDescription(part1)
             talentsEmbed.setFooter(`Sent ${sentCount} out of ${totalCount}.`);
             message.channel.send(talentsEmbed);
        }


        /*await new Promise((resolve) => {
            resolve(module.exports.queryTalents(talentTwo, talentRank, db, message, talentOneDoc));
          });*/
    },


    // unused 
    async Function(db, message, client, talentOneDoc, talentTwoDoc) { 

        let oneName = talentOneDoc.get("name");
        let oneMin = talentOneDoc.get("minWeight");
        let oneMax = talentOneDoc.get("maxWeight");
        let oneRank = talentOneDoc.get("rank");

        let twoName = talentTwoDoc.get("name");
        let twoMin = talentTwoDoc.get("minWeight");
        let twoMax = talentTwoDoc.get("maxWeight");
        let twoRank = talentTwoDoc.get("rank");

        try {
            
        } catch (err) {
            console.log(err);
        }

        await new Promise((resolve) => {
            resolve(module.exports.Function(db, message, client, talentOneDoc, talentTwoDoc));
          });
    }

};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}