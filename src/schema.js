const mongoose = require("mongoose");
const Schema = mongoose.Schema;

function createModel(name, fields) {
  return mongoose.model(name, new Schema(fields));
}

const TestCase = createModel("TestCase", {
    input: String,
    output: String,
    timeLimitSeconds: Number  // Seconds
});

const Problem = createModel("Problem", {
    name: String,
    description: String,
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"]
    },
    cases: [TestCase.schema],
    author: String,
    solution: String
});

module.exports = {
    Problem,
    TestCase
};