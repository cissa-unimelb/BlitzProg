const express = require("express");
const router = express.Router();
const schema = require("./schema");

/**
 * Submit a new problem with its test cases
 */
router.post("submit", (req, res) => {
    schema.TestCase.insertMany(req.body.testcases)
        .then((testcases) => {
            schema.Problem.insertMany([{
                name: req.body.name,
                description: req.body.description,
                difficulty: req.body.difficulty,
                status: "Pending",
                cases: testcases,
                author: req.body.author,
                solution: req.body.solution
            }])
                .then((problem) => {
                    res.send(problem);
                })
                .catch((error) => {
                    res.status(500).send(error.message);
                })
        });
});

module.exports = router;