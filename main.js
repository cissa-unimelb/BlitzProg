// Load environment variables in local development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); 
} 

// Load modules
const discord = require('discord.js');
const mongoose = require('mongoose');
const Schema = require('./schema');
const Game = require("./game");
const http = require("http");
const express = require("express");
const cors = require("cors");

// Initialize API for submitting problems
const app = express();
const server = http.createServer(app);
const api = require("./api");

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

      // -- DEBUGGING TEST CODE START --
      // // Add a problem to the database
      // var problemObject = {
      //   name: 'Problem Name',
      //   description: 'Problem Description',
      //   difficulty: "Easy",
      //   status: "Pending",
      //   cases: [{input: "1", output: "1", memoryLimitBytes: 1, timeLimitSeconds: 1}],
      //   author: 'Problem Author',
      //   verified: true
      // };

      // Schema.Problem.create(problemObject, function(err, result){
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log(result);
      //   }
      // });

      // // Retrieve a problem from the database
      // console.log('Hi');
      // Schema.Problem.find({difficulty: "Easy"}, (err, data) =>{
      //   if (err){
      //     console.log(err);
      //   } else {
      //     console.log(data);
      //   }
      // })
      // -- DEBUGGING TEST CODE END --

      // Only after this the bot will start reacting to information received from Discord
      client.on('ready', () => {
        console.log('BlitzProg is online!');
      });

      // Handle messages sent
      client.on('message', message => {
        // Making sure that the author of the message is not a bot
        if (message.author.bot) return false;

        // Bot should only run in the BlitzProg channel
        if (message.channel.id != '863230229488467978') return false; 

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
      });

      // Login to Discord
      client.login(process.env.DISCORD_API_KEY);

      // Assign a port to run our API
      const port = 4040;
      server.listen(process.env.PORT || port, () => {
        console.log(`API server listening on port *:${port}`);
      });
    }
);