const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({data: 'done a'})
})

module.exports = router;