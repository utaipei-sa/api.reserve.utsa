var express = require('express');
var router = express.Router();

/* GET signout process. */
router.get('/signout', function(req, res, next) {
    res.json({ title: 'Sign out' });
});

module.exports = router;
