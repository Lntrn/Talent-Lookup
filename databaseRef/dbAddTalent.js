// require discord.js module
const Discord = require("discord.js");
// require fireBase Driver
const firebase = require("firebase-admin");
const dbSecret = require("../utilities/firebase.json");
// require channels.js module
const Channels = require("../utilities/channels.js");
// require format.js module
const Format = require("../utilities/format.js");
// require error logger module
const ErrorLog = require("../utilities/error.js");
const Emojis = require("../utilities/emojis.js");

module.exports = {
    name: "dbAddTalent",
    description: "pushes a talent to database",
  async addTalent(client, talentInfo, message) {

      if (firebase.apps.length === 0) {
        console.log("Initilizing Database");
        firebase.initializeApp({
          credential: firebase.credential.cert(dbSecret),
          databaseURL: "https://project_O.firebaseio.com" 
        });
        db = firebase.firestore();
      } else {
        db = firebase.firestore();
      }
/*
        await new Promise((resolve) => {
          resolve(module.exports.getNextSequenceValue(talentInfo, message, db));
        });
*/
        await new Promise((resolve) => {
          resolve(module.exports.pushTalent(talentInfo, message, db));
        });

  },
  
  async pushTalent (talentInfo, message, db) {
    const talentList = db.collection("talents");
    let talentName = talentInfo.name;

    try { setTimeout(() => {
      talentList.doc(talentName).set(talentInfo);
      message.channel.send(`${Emojis.greenCheck.pub} **Upload complete!**`)}, 1000);
    } catch (err) {
      console.log(err);
    }
  }
};
