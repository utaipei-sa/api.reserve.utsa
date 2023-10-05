var express = require('express');
//var { spaces } = require('../models/mongodb');
var router = express.Router();

router.get('/spaces/:space_id', function(req, res, next) {
    req.params;
    res.json({ title: 'spaces' });
});

module.exports = router;