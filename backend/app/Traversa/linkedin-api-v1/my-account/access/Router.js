const express = require('express');
const router = express.Router();

router.get('/:id', (req, res) => {
    res.json({data: 'access-root' + req.params.id});
})

module.exports = router;