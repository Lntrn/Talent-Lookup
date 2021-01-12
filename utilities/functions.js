//const Config = JSON.parse(fs.readFileSync("./utilities/config.json", "utf8"))

//const Secret = require("../secret.json");
//const Discord = require("discord.js");
//const Functions = require("../utilities/functions.js")
//const fs = require("fs");
//const Enmap = require("enmap");
//const Channels = require("../utilities/channels.js");
//const Emojis = require("../utilities/emojis.js");
//const Roles = require ("../utilities/roles.js");
//const Servers = require ("../utilities/servers.js");
//const Sellers = require ("../utilities/sellers.js");

const date = new Date();
const getTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()

module.exports = {
    name: "functions",
    description: "sends errors that client encounters to a logging channel",

    square(message) {
      return message * message;
    },
    async executeError(client, message, error) {

      const Channels = require("../utilities/channels.js");

      console.error(error);
      const errorMessage = await message.channel.send(`Error executing command. Check terminal or ${Channels.errorLog.mention} for more details.`);
      errorMessage.delete({timeout:15000}).then(client.channels.cache.get(Channels.errorLog.id).send(`There was an error trying to execute that command! \n Error: " + error)`))
      console.log(`error message deleted at ${getTime}`);
    }
};
