const Sandbox = require("sandbox");

// Maintains a game state and contains the command function definitions
class Game {
    constructor() {
        this.running = false;
        this.canJoin = false;
        this.sandbox = new Sandbox();
    }
    
    initiate(message) {
        if(this.running) {
            return;
        }

        // Get player role 
        let playerRole = message.guild.roles.cache.find(role => role.name === "Player");

        message.channel.send('Initiating Game');
        this.running = true;
        this.canJoin = true;

        // Add current player to game
        let member = message.member;
        member.roles.add(playerRole).catch(console.error);
    }

    join(message) {
        if(!this.canJoin) {
            return;
        }
                
        // Get player role 
        let playerRole = message.guild.roles.cache.find(role => role.name === "Player");

        message.channel.send('Adding Player');
        let member = message.member;
        member.roles.add(playerRole).catch(console.error);
    }

    start(message) {
        // Ensure that there is a player in the game
        if(!this.canJoin || !message.member.roles.cache.some(role => role.name === "Player")) {
            return;
        }
        message.channel.send('Starting Game');
        this.canJoin = false;
    }

    end(message) {
        if(!this.running) {
            return;
        }

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
        role.delete('I had to');
    }

    submit(message) {
        code = message.content.replace('!submit', '');
        code = code.replace("```", "");
        code = code.replace("```", "");
        
        // Output the submission details
        message.channel.send('USER: ');
        message.channel.send(message.member.user.tag);
 
        // Sandbox the code submitted by the user
        message.channel.send('OUTPUT: ');
        this.sandbox.run(code, function(output){
            message.channel.send(output.console);
            console.log(output.console);
        });
    }
};

module.exports = Game;