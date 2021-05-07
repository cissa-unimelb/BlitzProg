// Load environment variables in local development
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Load modules
const discord = require('discord.js');
const mongoose = require('mongoose');
const Sandbox = require("sandbox");

// Create an instance of a Discord client and Sandbox
const client = new discord.Client();
const sandbox = new Sandbox();

// Connect to the database
mongoose.connect(
    process.env.DATABASE_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Connected to db!");
      }
    }
);

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
        sandbox.run(code, function(output){
            message.channel.send(output.console);
            console.log(output.console);
        })
    } 
})

client.login(process.env.DISCORD_API_KEY);