var express = require('express');
var router = express.Router();

/* GET dashboard page. */
router.get('/dashboard', function(req, res, next) {
    res.json({ title: 'Dashboard' });
});

module.exports = router;
