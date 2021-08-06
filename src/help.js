// Give a description of all admin and game commands
async function helpCommand(message) {
    message.channel.send("This is a test");
    if (message.member.roles.cache.some(role => role.name === "Committee")) {
        let commands = `
!list
Present all pending problems 

!read (id)
Find a specific problem for verification

!testcases (id)
List the test cases for a specific problem
`;
        message.channel.send(commands);
    } else {
        let commands = `
!initiate
Gather players for a game of BlitzProg
        
!join
Join the current BlitzProg game
        
!start
Start a game of BlitzProg with the current players
        
!submit
Submit your code for the current round and have it tested
(You may submit as many times as you would like before the round ends but only your latest submission will be counted)
        
!end
End the current game of BlitzProg   
`;
        message.channel.send(commands);
    }
}



module.exports = {
    helpCommand 
};