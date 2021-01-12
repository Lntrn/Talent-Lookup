module.exports = {
    supportLink: " \"Head to our Support Server for help!\"",
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
