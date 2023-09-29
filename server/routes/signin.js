var express = require('express');
var { users } = require('../models/mongodb');
var router = express.Router();

/* GET signin page. */
router.get('/signin', async function(req, res, next) {
    //const result = await users.insertOne({ name: "Tester" });
    res.json({ title: 'Sign in'});
});

/* POST signin process */
router.post('/signin', function(req, res, next) {
    res.redirect('/signin');
});

module.exports = router;
