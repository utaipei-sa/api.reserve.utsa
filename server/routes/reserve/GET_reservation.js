var express = require('express');
var ObjectID = require('mongodb').ObjectId;
var { reservations, spaces_reserved_time, items_reserved_time } = require('../../models/mongodb');
//const { Timestamp } = require('mongodb');
var router = express.Router();

router.get('/reservation/:reservation_id', async function(req, res, next) {
    const result = await reservations.findOne({"_id": new ObjectID(req.params.reservation_id)});
    //convert time slots
    res.json({ data: result });
});

module.exports = router;