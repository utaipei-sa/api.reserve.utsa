var express = require('express');
//var { spaces } = require('../models/mongodb');
var router = express.Router();

router.get('/spaceAvailability/:space_id', function(req, res, next) {
    req.params;
    res.json({ title: 'space availability' });
});

module.exports = router;