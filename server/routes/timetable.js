var express = require('express');
var router = express.Router();

/* GET timetable page. */
router.get('/timetable', function(req, res, next) {
    res.json({ title: 'Timetable' });
});

module.exports = router;
