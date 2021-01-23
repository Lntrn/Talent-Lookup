module.exports = {
    footer: {
        desc: "If you have any suggestions or questions feel free to dm the bot.",
        image: "https://i.imgur.com/a1FU6pS.png"
    },
    emptyChar: " ‎",
    space(amt) {
        let whitespace = "";

        let i;
        for (i = 0; i < amt; i++) {
            whitespace += "\u00A0";
        }

        return whitespace;
    },
    memberCount(client) {
        let count = 0;

        const servers = client.guilds.cache.array().sort();
        servers.forEach( (server) => count += server.memberCount );

        return count;
    }
}
