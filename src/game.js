const Sandbox = require("sandbox");
const discord = require('discord.js');
const { Schema } = require("mongoose");
const client = new discord.Client();
const schema = require("./schema");

// Maintains a game state and contains the command function definitions
class Game {
    constructor() {
        this.running = false;
        this.canJoin = false;
        this.timeLeft = false;
        this.sandbox = new Sandbox();
        this.easyProblems = [];
        this.mediumProblems = [];
        this.hardProblems = [];
        this.currProblem = new schema.Problem();
        this.problemQueue = [];
        this.playerPoints = {"Keith": 55, "Abrar": 65};
        this.currPoints = 0; 
    }
    
    init(message) {
        if(this.running) {
            return;
        }

        // Get player role 
        let playerRole = message.guild.roles.cache.find(role => role.name === "Player");

        message.channel.send('Initiating Game');
        this.canJoin = true;
    }

    join(message) {
        if(!this.canJoin) {
            return;
        }
                
        // Get player role 
        let playerRole = message.guild.roles.cache.find(role => role.name === "Player");

        //Add current player to the game
        message.channel.send('Adding Player');
        let member = message.member;
        member.roles.add(playerRole).catch(console.error);
    }

    start(message) {

        // Command format:
        // !start [Number of Easy] [Number of Medium] [Number of Hard] [Easy Timer] [Medium Timer] [Hard Timer]
        // Example 1:
        // !start 2 1 1 30 30 30
        // Example 2:
        // !start 2 0 0 30 0 0

        let startArgs = message.content.split(' ');
        if (startArgs.length != 7){
            message.channel.send('Wrong number of command paramaters. Game cannot be started');
            return;
        }
        let numEasy = Number(startArgs[1]);
        let numMedium = Number(startArgs[2]);
        let numHard = Number(startArgs[3]);
        let easyTimer = Number(startArgs[4]);
        let mediumTimer = Number(startArgs[5]);
        let hardTimer = Number(startArgs[6]);

        // Ensure that there is a player in the game
        if(!this.canJoin || !message.member.roles.cache.some(role => role.name === "Player")) {
            message.channel.send('There are no players so game cannot be started');
            return;
        }
        message.channel.send('Starting Game');
        this.canJoin = false;
        this.running = true;
        this.timeLeft = true;
        
        // The round should last for x seconds
        this.timeLeft = client.setTimeout(() => this.updateTimeState(message), 1500000);

        // Display a verified problem from the database
        let self = this; 
        async function pull(message){


            // Store the problems for each type of difficulty
            if (numEasy > 0){
                self.easyProblems = await schema.Problem.find({ status: "Verified", difficulty: "Easy"}).exec();
            }
            if (numMedium > 0) {
                self.mediumProblems = await schema.Problem.find({ status: "Verified", difficulty: "Medium"}).exec();
            }
            if (numHard > 0) {
                self.hardProblems = await schema.Problem.find({ status: "Verified", difficulty: "Hard"}).exec();
            }

            // Check if there are enough problems for the game 
            if(self.easyProblems.length < numEasy || self.mediumProblems.length < numMedium || self.hardProblems.length < numHard) {
                message.channel.send("There are not enough problems in the database. Game cannot be started");
                return null;
            }
            else {

                // Display a random problem of the given difficulty
                self.currProblem = self.easyProblems[Math.floor(Math.random() * self.easyProblems.length)];
                //this.currProblem = randEasy;
                message.channel.send({ embed: {
                    color: 15158332,
                    title: "Programming Challenge",
                    fields: [{
                        name: "Problem Name",
                        value: self.currProblem.name
                    },
                    {
                        name: "Diffculty",
                        value: self.currProblem.difficulty
                    },
                    {
                        name: "Description",
                        value: self.currProblem.description
                    }
                ]
                }});
            }
        }
        pull(message);
    }

    end(message) {
        if(!this.running) {
            return;
        }

        // Form the leaderbaord
        console.log(this.playerPoints);
        var leaderboard = [];
        for (var key in this.playerPoints){
            leaderboard.push([key, this.playerPoints[key]]);
        }
        leaderboard.sort(function compare(p1, p2){
            return p2[1] - p1[1];
        })

        // Display the leaderboard
        let leaderboardEmbed = new discord.MessageEmbed()
            .setTitle('Leaderboard')
            .setColor(3066993);
        for (let i = 0; i < leaderboard.length ; i++){
            leaderboardEmbed.addField(String(i + 1) + ". " + String(leaderboard[i][0]), "Points: " + String(leaderboard[i][1]));
        }
    
        message.channel.send(leaderboardEmbed);    

        message.channel.send('Ending Game');
        this.running = false;
   
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
        });
        role.delete();
    }

    submit(message) {
        this.currPoints = 0;

        // Pre-process the user submission for sandboxing
        var code = message.content.replace('!submit', '');
        if (!code.includes("```")){
            message.author.send('SUBMISSION DETAILS: *Invalid code format*');
            return;
        }
        code = code.replace("```", "");
        code = code.replace("```", "");
        if (code.match(/^ *$/) !== null){
            message.author.send('SUBMISSION DETAILS: *Invalid code format*');
            return;
        }
        if (!code.includes('input')){
            message.author.send("SUBMISSION DETAILS: No 'input' paramter in the function call. Code cannot be checked against test cases");
            return;
        }

       ///// var obj = {a: 1, b: 2, undefined: 54757}; find highest val
       ///// console.log(Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b)); 

        // Replace the input paramters of the code submission to check against test cases
        var n = code.lastIndexOf("input");
        message.author.send('** ** ');
        message.author.send("SUBMISSION RESULTS: ");
        message.author.send('** ** ');
        // Check against all test cases
        for (let i = 0; i < this.currProblem.cases.length ; i++){
            let codeCheck = code.slice();

            // Replace newline characters with whitespaces
            let testCaseInput = this.currProblem.cases[i].input.replace("\n", " ");
            codeCheck = codeCheck.slice(0, n) + codeCheck.slice(n).replace("input", String('"' + testCaseInput + '"'));

            // Sandbox the code submitted by the user
            let self = this;
            this.sandbox.run(codeCheck, function(output){
                // Check against all test for the given problem
                if (output.result == self.currProblem.cases[i].output){
                    message.author.send('Test case ' + String(i + 1)   + ' passed!');
                    self.currPoints += 5;
                    console.log(self.currPoints);
                } else {
                    message.author.send('** ** ');
                    message.author.send('Test case ' + String(i + 1)   + ' failed');
                    message.author.send('Your output: ' + String(output.result));
                    message.author.send('Required output: ' + String(self.currProblem.cases[i].output));
                    message.author.send('** ** ');
                }

                // Store the points of the player
                if (message.member.displayName in self.playerPoints){
                    if (self.playerPoints[message.member.displayName] < self.currPoints){
                        self.playerPoints[message.member.displayName] = self.currPoints;
                    }
                } else {
                    self.playerPoints[message.member.displayName] = self.currPoints;
                }
            });    
        }


    };

    updateTimeState(message) {
        this.timeLeft = false;
        message.channel.send("This round is now over")
    }

};

module.exports = Game;