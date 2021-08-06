const discord = require('discord.js');
const client = new discord.Client();

// Give a description of all admin and game commands
async function helpCommand(message) {
    if (message.member.roles.cache.some(role => role.name === "Committee")) {
        message.channel.send({ embed: {
            color: 3066993,
            title: "Admin Command List",
            fields: [{
                name: "!list",
                value: "Present all pending problems"
            },
            {
                name: "!read (id)",
                value: "Find a specific problem for verification"
            },
            {
                name: "!testcases (id)",
                value: "List the test cases for a specific problem"
            }

            
        ]
        }});
    } else {
        message.channel.send({ embed: {
            color: 15158332,
            title: "Player Command List",
            fields: [{
                name: "!init",
                value: "Gather players for a game of BlitzProg"
            },
            {
                name: "!start",
                value: "Start a game of BlitzProg with the current players"
            },
            {
                name: "!submit",
                value: "Submit your code for the current round and have it tested"
            },
            {
                name: "!end",
                value: "End the current game of BlitzProg "
            }
        ]
        }});
    }    
}

module.exports = {
    helpCommand 
};