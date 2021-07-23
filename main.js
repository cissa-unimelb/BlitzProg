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

// Tracks game status
game_active = false;
join_active = false;

// Event listener for messages
client.on('message', message =>{

    // Making sure that the author of the message is not a bot
    if (message.author.bot) return false;

    // Bot should only run in the BlitzProg channel
    if (message.channel.id != '863230229488467978') return false; 

    // Get player role 
    let playerRole = message.guild.roles.cache.find(role => role.name === "Player");


    // Game initating process
    if (message.content == '!initiate' && game_active == false){
      message.channel.send('Initiating Game');
      game_active = true;
      join_active = true;

      // Add current player to game
      let member = message.member;
      member.roles.add(playerRole).catch(console.error);

    }

    // Game joining process
    if (join_active == true){
      if (message.content == '!join'){
        message.channel.send('Adding Player');
        let member = message.member;
        member.roles.add(playerRole).catch(console.error);
      } else if (message.content == '!start'&& message.member.roles.cache.some(role => role.name === "Player")){
        message.channel.send('Starting Game');
        join_active = false;
      }
    }

    // Game ending process
    if (message.content == '!end' && game_active == true){
      message.channel.send('Ending Game');
      game_active = false;

      // Remove all players from the game 
      const role = message.guild.roles.cache.find(role => role.name === 'Player');
      message.guild.roles.create({
        data: {
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          position: role.position,
          permissions: role.permissions,
          mentionable: role.mentionable
        }         
      })
      role.delete('I had to')
    }

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