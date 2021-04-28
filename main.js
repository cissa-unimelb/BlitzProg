const Discord = require('discord.js');
var Sandbox = require("sandbox");
s = new Sandbox();

// Create an instance of a Discord client
const client = new Discord.Client();

// Only after this the bot will start reacting to information received from Discord
client.on('ready', () => {
    console.log('BlitzProg is online!');
});

// Event listener for messages

client.on('message', message =>{

    // Making sure that the author of the message is not a bot
    if (message.author.bot) return false;

    // Only take in the input if it starts with the !submit command
    if (message.content.startsWith('!submit')){
        code = message.content.replace('!submit', '');
        code = code.replace("```", "");
        code = code.replace("```", "");
        
        // Output the submission details
        message.channel.send('USER: ');
        message.channel.send(message.member.user.tag);

        // Sandbox the code submitted by the user
        message.channel.send('OUTPUT: ');
        s.run(code, function(output){
            message.channel.send(output.console);
            console.log(output.console);
        })
    } 
})

// END

client.login('ODM2ODE2MDM0Mzk5NzgwOTA0.YIjfqQ.SPgldyY5bCcEjv-eceS5O484KIM');