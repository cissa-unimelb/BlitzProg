const Discord = require('discord.js');
var Sandbox = require("sandbox");
s = new Sandbox();

// Create an instance of a Discord client
const client = new Discord.Client();

// Only after this the bot will start reacting to information received from Discord
client.on('ready', () => {
    console.log('Code_Bot is online!');
});

// Event listener for messages

client.on('message', message =>{

    // Making sure that the author of the message is not a bot
    if (message.author.bot) return false;

    // Only take in the input if it starts with the !submit command
    if (message.content.startsWith('!submit')){
        code = message.content.replace('!submit', '');
        
        // Output the submission details
        message.channel.send('USER: ');
        message.channel.send(message.member.user.tag);

        // Sandbox the code submitted by the user
        message.channel.send('OUTPUT: ');
        s.run(code, function(output){
            message.channel.send(output.result);
            console.log(output.result);
        })
    } 
})

// END

client.login('ODI5NDA4MjMzMTE3NDUwMzEy.YG3snA.YX_O1xli-I5T_E0jOdDnit_OhjE');