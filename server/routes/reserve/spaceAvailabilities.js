var express = require('express');
//var { spaces } = require('../../models/mongodb');
var router = express.Router();

router.get('/spaceAvailabilities/:space_id', function(req, res, next) {
    req.params;
    res.json({ title: 'space availabilities' });
});

module.exports = router;