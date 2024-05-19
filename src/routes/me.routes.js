const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        "name": "YOUR NAME", // Replace with your name
        "student_number": "YOUR STUDENT NUMBER"  // Replace with your student number
    });
});

module.exports = router;