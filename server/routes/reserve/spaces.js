var express = require('express');
//var { spaces } = require('../models/mongodb');
var router = express.Router();

router.get('/spaces', function(req, res, next) {
    // temporary
    const data = {
        data: [
            {
                id: "5303d74c64f66366f00cb9b2a94f3251bf5",
                name: {
                    "zh-tw": "學生活動中心",
                    "en": "Student Activity Center"
                }
            }, 
            {
                id: "9821b87e24b83626f00cb9b2a94d8264c97",
                name: {
                    "zh-tw": "勤樸樓B1小舞台",
                    "en": "Cin-Pu Building B1 Stage"
                }
            }
        ]
    }
    res.json(data);
});

module.exports = router;