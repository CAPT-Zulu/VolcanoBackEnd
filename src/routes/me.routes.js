const express = require("express");
const router = express.Router();

// Me route (Used for assessment purposes)
router.get('/', (req, res) => {
    // Return owner details saved in .env
    res.json({
        "name": process.env.OWNER_NAME,
        "student_number": process.env.OWNER_NUMBER,
    });
});

module.exports = router;