var express = require('express');
var router = express.Router();

/* GET signin page. */
router.get('/signin', function(req, res, next) {
    res.json({ title: 'Sign in' });
});

/* POST signin process */
router.post('/signin', function(req, res, next) {
    res.redirect('/signin');
});

module.exports = router;
