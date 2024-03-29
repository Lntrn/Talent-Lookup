const Discord = require("discord.js");
const Functions = require("./utilities/functions.js")
require('dotenv-flow').config();
const fs = require("fs");
const Enmap = require("enmap");
const Channels = require("./utilities/channels.js");
const Emojis = require("./utilities/emojis.js");
const date = new Date();

const Config = JSON.parse(fs.readFileSync("./utilities/config.json", "utf8"));

let hours = date.getHours();
let minutes = date.getMinutes();
let seconds = date.getSeconds();

let sec = `${seconds}`
if (sec.length === 1) {
  seconds = `${seconds}0`
} 
let min = `${minutes}`
if (min.length === 1) {
  minutes = `${minutes}0`
} 
if (hours.length === 1) {
  hours = `${hours}`
} 

let startupMessage = `Client online! **${hours}:${minutes}:${seconds}**`

//let command;

// create new client
const client = new Discord.Client();
// create collection of client commands / events
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.events = new Discord.Collection();

const modules = ["commands"];

client.commands = new Enmap();

modules.forEach(module => {
  fs.readdir(`./${module}/`, (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
      if (!file.endsWith(".js")) return;
      let props = require(`./${module}/${file}`);
      let commandName = file.split(".")[0];
      console.log(`Attempting to load command ${commandName}`);
      client.commands.set(commandName, props);
    });
  });
});

// fill event collection
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
  let event = require(`./events/${file}`);
  client.events.set(event.name, event); 
}

client.on("ready", async () => {

  if (Config.devmode) {
    client.user.setPresence({
      status: "invisible"
    });
  } else {
    client.user.setPresence({
      activity: {
        name: "my pets fail",
        type: "WATCHING"
      },
      status: "dnd"
    });
  }

  // send startup confirmation
  try {
    console.log(`${client.user.tag} is ready!`);
    client.channels.cache.get(Channels.botStatus.id).send(startupMessage)
      .then(m => m.react(Emojis.pumpkin.id));
  } catch (err) {
    console.log("Error sending startup confirmation! Error: ", err.message);
  }
});

client.on("error", (error) => {
  if (Config.devmode) {
    client.login(process.env.DEVTOKEN);
  } else {
    client.login(process.env.TOKEN);
  } 

  let cmd = undefined
  
  ErrorLog.log(client, message, message.guild.id, cmd, error)
});

client.on("message", async (message) => {

  const owner = await client.users.fetch(Config.ownerID);

  let prefix;
  if (!Config.devmode) {
    prefix = `t!`;
  } else {
    prefix = "lumeo is awesome"
  }
  const mention = `<@${client.user.id}>`;
  const nicknameMention = `<@!${client.user.id}>`;

  const prefixCheck = message.content.substr(0, prefix.length);
  const mentionCheck = message.content.substr(0, mention.length);
  const nicknameMentionCheck = message.content.substr(0, nicknameMention.length);

  // if a client sent the message, ignore
  if (message.author.bot)
    return;

  if (message.channel.type === 'dm' ) {
    let dmEmbed = new Discord.MessageEmbed()
      .setTitle(message.author.tag)
		  .setThumbnail(message.author.avatarURL())
		  .setColor("#310ff5")
      .setDescription(`User ID: \`${message.author.id}\`\nUser Mention: <@${message.author.id}>\nMessage content: \n>>> ${message.content}`)
      .setImage(message.attachments[0])

    let toSend = "Your message has been forwarded."
    message.channel.send(toSend)
    if (message.attachments.length !== 1) {
      attachments = message.attachments;
    } else {
      dmEmbed.setImage(message.attachments[0]);
    }
    client.channels.cache.get(Channels.chat.id).send(dmEmbed);
    if (attachments) {
      return client.channels.cache.get(Channels.chat.id).send("Message attachments", attachments);
    } else {
      return console.log("no attackments");
    }

    
  }

  let args;
  // Check for prefixes
  if (prefixCheck === prefix) {
    args = message.content.slice(prefix.length).split(/[\s|\r?\n|\r]/);
  } else if (mentionCheck === mention) {
    args = message.content.slice(mention.length).trim().split(/[\s|\r?\n|\r]/);
  } else if (nicknameMentionCheck === nicknameMention) {
    args = message.content.slice(nicknameMention.length).split(/[\s|\r?\n|\r]/);
  } else {
    return;
  }

  // console.log(args);

  args = args.filter(ele => ele !== "" && ele !== " ");
  // retrieve command
  if (args.length !== 0) {
    commandName = args.shift().toLowerCase();
  } else {
    return message.channel.send(`Say "<@${client.user.id}> help" for help`);
  }
  const command = client.commands.get(commandName) || 
    client.commands.find(command => command.aliases && command.aliases.includes(commandName) || 
      client.commands.find(command => command.id && command.id.includes(commandName)));

  if (!command) {
    return;
    //toFind = "unrecognized"
    //const unrecognized = client.commands.get(toFind)
    //	|| client.commands.find(command => command.aliases && command.aliases.includes(toFind) || client.commands.find(command => command.id && command.id.includes(toFind)));
    //unrecognized.execute(client, message).catch((err) => {
    //    client.users.fetch(Config.ownerID)
    //});
  }

  if (command) {
    try {
      command.execute(client, message, args);
    } catch (error) {
      Functions.executeError(client, message, error);
    };
  } else {
    unrecognizedCommand = "unrecognized"
    const unrecognized = client.commands.get(unrecognizedCommand);
    unrecognized.execute(client, message).catch((err) => {
      client.users.fetch(Config.ownerID)
    });
  }
});

client.on("guildCreate", guild => {
  client.events.get("guildCreate").execute(client, guild);
});

client.on("guildDelete", guild => {
  client.events.get("guildDelete").execute(client, guild);
});

client.on("guildUpdate", (oldGuild, newGuild) => {
  client.events.get("guildUpdate").execute(client, oldGuild, newGuild);
})


if (Config.devmode) {
  client.login(process.env.DEVTOKEN);
} else {
  client.login(process.env.TOKEN);
}