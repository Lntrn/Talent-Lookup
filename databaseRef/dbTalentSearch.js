//const talentList = require("../databaseRef/talentList.json");

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
    name: "dbTalentSearch",
    description: "checks for talents in the database",

    async multiLogin(client, message, args) { 

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

      message.channel.send("connecting to database, please wait");
      await new Promise((resolve) => {
        resolve(module.exports.checkTalents(args, db, message));
      });

    }, 

async checkTalents(args, db, message) {

    let argsStr = args.join(" ");
    let talents = argsStr.toLowerCase();
    let talentsArray = talents.split(",");
    let sentCount = 0;
    let totalCount = 0;

    let talent = [];
    let p = 0;

    let authorTag = message.author.tag;
    let authorAv = message.author.avatarURL();

    let searchEmbed = new Discord.MessageEmbed()
            .setTitle(authorTag)
            .setThumbnail(authorAv)
            .setColor("#310ff5")

    for (let talentName of talentsArray) {
      let trimmedName = talentName.trim();
      console.log(trimmedName)

      if (trimmedName.includes("-")) {
        trimmedName = trimmedName.replace("-", " ");
      }

      let talentDoc;
      if (trimmedName.length !== 0) {
        talentDoc = db.collection("talents").doc(`${trimmedName}`);
        //talentDoc = db.collection("talents").doc("includes(trimmedName)");
      } else {
        return message.channel.send("missing talents");
      }

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
        totalCount++;

        let argsArray = [];
        let a = 0;

        args.forEach(arg => {
          argsArray[a] = capitalize(arg);
          a++;
        })

          //console.log(argsArray)

        /*let underscore = name.split(" ").map(capitalize).join("_"); 
        let dash = name.split(" ").map(capitalize).join("-");
        //console.log(userInput)
        let underscoreURL = `http://www.wizard101central.com/wiki/PetAbility:${underscore}`;
        let dashURL = `http://www.wizard101central.com/wiki/PetAbility:${dash}`;*/

        if (name === undefined || rank === undefined) {
          message.channel.send(`check spelling or talent is not yet in db \`${trimmedName}\``);
        } else {
          let cappedName = name.split(" ").map(capitalize).join(" ");
          let cappedRank = rank.split(" ").map(capitalize).join(" ");
          /*let tal = {
            "minWeight": parseInt(minWeight),
            "desc": `[${cappedName}](${underscoreURL})(${minWeight} - ${maxWeight}) // ${Emojis.powerPip.pub} **${cappedRank}**`
          }*/
          let tal = {
            "minWeight": parseInt(minWeight),
            "desc": `${cappedName}(${minWeight} - ${maxWeight}) // ${Emojis.powerPip.pub} **${cappedRank}**`
          }
          talent[p] = tal;
          sentCount++;
          p++;
          }
        }
      }
      talent.sort(function(a, b) {
        if (a.minWeight < b.minWeight) {
          return -1;
        }
        else {
          return 1;
        }
      })
      
      let justTalent = [];
      for (let k = 0; k < talent.length; k++) {
        justTalent[k] = talent[k].desc;
      }
      let talentDesc = justTalent.join(" \n"); 

      searchEmbed.setDescription(talentDesc);
      searchEmbed.setFooter(`Sent ${sentCount} out of ${totalCount} talents`);
      message.channel.send(searchEmbed);
  }
    
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}