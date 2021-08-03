const fs = require('fs');
const schema = require("./schema");

async function list(message) {
    let pending = await schema.Problem.find({ status: "Pending" }).exec();
    let strings = [];
    for(let problem of pending) {
        strings.push(`'${problem.name}' by ${problem.author}\nID: ${problem._id}`);
    }
    if(strings.length == 0) {
        message.channel.send("There are currently no pending problem submissions.");
    }
    else {
        message.channel.send(strings.join('\n\n'));
    }
}

async function read(message) {
    let id = message.content.split(' ')[1];
    let problem;
    try {
        problem = await schema.Problem.findById(id).exec();
        if(problem.status != "Pending") {
            message.channel.send("Invalid problem ID.");
            return;
        }
    }
    catch {
        message.channel.send("Invalid problem ID.");
        return;
    }

    // Handle verifying or rejecting the problem
    message.channel.send(`'${problem.name}' by ${problem.author}\nID: ${problem._id}\n\n${problem.description}\n\nDifficulty: ${problem.difficulty}`)
        .then(async (reply) => {
            reply.react('👍');
            reply.react('👎');
            let filter = (reaction, user) => {
                return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
            }
            reply.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] })
                .then(async (collected) => {
                    const reaction = collected.last();
            
                    if (reaction.emoji.name === '👍') {
                        await schema.Problem.findByIdAndUpdate(id, {status: "Verified"}).exec();
                        message.channel.send(`The '${problem.name}' problem has been verified.`);
                    }
                    else {
                        await schema.Problem.findByIdAndDelete(id).exec();
                        message.channel.send(`The '${problem.name}' problem has been rejected.`);
                    }
                })
                .catch((collected) => {
                    message.channel.send('Time limit expired. Please react to verify or reject the submission.');
                });
        });
}

async function testcases(message) {
    let id = message.content.split(' ')[1];
    let problem;
    try {
        problem = await schema.Problem.findById(id).exec();
        if(problem.status != "Pending") {
            message.channel.send("Invalid problem ID.");
            return;
        }
    }
    catch {
        message.channel.send("Invalid problem ID.");
        return;
    }

    let json = [];
    for(let testcase of problem.cases) {
        json.push({
            input: testcase.input,
            output: testcase.output,
            memoryLimitBytes: testcase.memoryLimitBytes,
            timeLimitSeconds: testcase.timeLimitSeconds,
        })
    }
    fs.writeFile('testcases.json', JSON.stringify(json), 'utf8', (err) => {
        if(!err) {
            message.channel.send({files: ['testcases.json']});
        }
    });
}

module.exports = {
    list,
    read,
    testcases
};