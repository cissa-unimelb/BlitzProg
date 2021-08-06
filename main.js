// Load environment variables in local development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); 
} 

// Load modules
const discord = require('discord.js');
const mongoose = require('mongoose');
const Game = require("./src/game");
const http = require("http");
const express = require("express");
const cors = require("cors");

// Initialize API for submitting problems
const app = express();
const server = http.createServer(app);
const api = require("./src/api");
const { list, read, testcases } = require("./src/admin");
const { hi } = require("./src/help");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api", api);

// Create an instance of a Discord client and the Game
const client = new discord.Client();
const game = new Game();

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
        return;
      }
      console.log("Connected to db...");

      // Only after this the bot will start reacting to information received from Discord
      client.on('ready', () => {
        console.log('BlitzProg is online!');
      });

      // Handle messages sent
      client.on('message', message => {
        // Making sure that the author of the message is not a bot
        if (message.author.bot) return false;

        // Bot should only run in the BlitzProg channel
        // if (message.channel.id != '863230229488467978') return false; 

        // Game commands
        if (message.content == '!initiate'){
          game.initiate(message);
        }
        if (message.content == '!join') {
          game.join(message);
        }
        if (message.content == '!start') {
          game.start(message);
        }
        if (message.content.startsWith('!submit')) {
          game.submit(message);
        }
        if (message.content == '!end') {
          game.end(message);
        }

        // Admin commands
        if(message.content == '!list') {
          list(message);
        }
        if(message.content.startsWith('!read')) {
          read(message);
        }
        if(message.content.startsWith('!testcases')) {
          testcases(message);
        }

         // Help command
         if (message.content == '!help') {
          helpCommand(message);
        }


      });

       

      // Login to Discord
      client.login("ODI5NDA4MjMzMTE3NDUwMzEy.YG3snA.dBa6pdzsq2So3uwPUkhhMd9X7y4");

      // Assign a port to run our API
      const port = 4040;
      server.listen(process.env.PORT || port, () => {
        console.log(`API server listening on port *:${port}`);
      });
    }
);