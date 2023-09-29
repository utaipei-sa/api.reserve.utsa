var express = require('express');
var router = express.Router();

/* GET reserve page. */
router.get('/form', function(req, res, next) {
    res.json({ title: 'Reserve Form' });
});

module.exports = router;
