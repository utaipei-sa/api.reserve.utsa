var express = require('express');
var ObjectID = require('mongodb').ObjectID;  
var { reservations } = require('../../models/mongodb');
var router = express.Router();

router.get('/reservation/:reservation_id', async function(req, res, next) {
    const result = await reservations.findOne({"_id": new ObjectID(req.params.reservation_id)});
    //convert time slots
    res.json({ data: result });
});

router.post('/reservation', async function(req, res, next) {
    //req.body.{{param}}
    const doc = {
        submit_time: req.body.submit_time,
        organization: req.boty.organization,
        contact: req.body.contact,
        email: req.body.email, //check with regex
        space_reservations: [], //convert format
        item_reservations: [], //convert format
        note: req.body.note
    }
    const result = await reservations.insertOne(doc);
    //result.insertedId
    //send email
    res.json({ title: 'New Reservation' });
});

router.put('/reservation/:reservation_id', function(req, res, next) {
    res.json({ title: 'New Reservation' });
});

router.delete('/reservation/:reservation_id', function(req, res, next) {
    res.json({ title: 'New Reservation' });
});

module.exports = router;