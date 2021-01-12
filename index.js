const Secret = require("./secret.json"),
  Discord = require("discord.js"),
  Functions = require("./utilities/functions.js"),
  fs = require("fs"),
  Enmap = require("enmap"),
  Channels = require("./utilities/channels.js"),
  Emojis = require("./utilities/emojis.js"),
  date = new Date(),
  Config = require("./utilities/config.json");

let hours = date.getHours(), minutes = date.getMinutes(), seconds = date.getSeconds();

if (seconds.length === 1) {
  seconds = `${seconds}0`
} 
if (minutes.length === 1) {
  minutes = `${minutes}0`
} 
if (hours.length === 1) {
  hours = `${hours}0`
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
      console.log(`Attempting to load command ${commandName}`)
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

    client.user.setPresence({
      activity: {
        name: "Wizard101",
        type: "PLAYING"
      },
      status: "dnd"
    });


  // send startup confirmation
  try {
    console.log(`${client.user.tag} is ready!`);
    client.channels.cache.get(Channels.botStatus.id).send(startupMessage)
      .then(m => m.react(Emojis.pumpkin.id));
  } catch (err) {
    console.log("Error sending startup confirmation! Error: ", err.message);
  }
});

client.on("message", async (message) => {

  const owner = await client.users.fetch(Config.ownerID),
    prefix = `t!`,
    mention = `<@${client.user.id}>`,
    nicknameMention = `<@!${client.user.id}>`,
    prefixCheck = message.content.substr(0, prefix.length),
    mentionCheck = message.content.substr(0, mention.length),
    nicknameMentionCheck = message.content.substr(0, nicknameMention.length);

  // if a client sent the message, ignore
  if (message.author.bot)
   return;

  let args;
  // Check for prefixes
  if (prefixCheck === prefix){
    args = message.content.slice(prefix.length).split(/[\s|\r?\n|\r]/);
  } else if (mentionCheck === mention) {
    args = message.content.slice(mention.length).trim().split(/[\s|\r?\n|\r]/);
  } else if (nicknameMentionCheck === nicknameMention) {
    args = message.content.slice(nicknameMention.length).split(/[\s|\r?\n|\r]/);
  } else {
    return;
  }

  args = args.filter(ele => ele !== "" && ele !== " ");
  // retrieve command
  if (args.length !== 0) {
    commandName = args.shift().toLowerCase();
  } else {
    return message.channel.send(`Say "<@${client.user.id}> help" for help`);
  }
  const command = client.commands.get(commandName) ||
    client.commands.find(command => command.aliases && command.aliases.includes(commandName) || client.commands.find(command => command.id && command.id.includes(commandName)));

  if (!command) return;

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

client.login(Secret.token);
