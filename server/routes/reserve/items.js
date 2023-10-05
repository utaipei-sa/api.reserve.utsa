var express = require('express');
//var { items } = require('../models/mongodb');
var router = express.Router();

router.get('/items', function(req, res, next) {
    // temporary
    const data = {
        data: [
            {
                id: "2936d09a85f66366f00cb9b2a94f8375ce2",
                name: {
                    "zh-tw": "塑膠椅",
                    "en": "Plastic Chairs"
                }
            }, 
            {
                id: "8274e98c24f66366f00cb9b2a94f0836a83",
                name: {
                    "zh-tw": "長桌",
                    "en": "Tables"
                }
            }
        ]
    }
    res.json(data);
});

module.exports = router;