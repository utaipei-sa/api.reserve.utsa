var express = require('express');
var ObjectID = require('mongodb').ObjectId;
var { reservations, spaces_reserved_time, items_reserved_time } = require('../../models/mongodb');
const { Timestamp } = require('mongodb');
var router = express.Router();

router.get('/reservation/:reservation_id', async function(req, res, next) {
    const result = await reservations.findOne({"_id": new ObjectID(req.params.reservation_id)});
    //convert time slots
    res.json({ data: result });
});

router.post('/reservation', async function(req, res, next) {
    const EMAIL_REGEXP = new RegExp('^[\w-\.\+]+@([\w-]+\.)+[\w-]{2,4}$');
    const ISODATE_REGEXP = new RegExp('^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)\+08:00$');  // time zone: (((-|\+)(\d{2}):(\d{2})|Z)?) --> \+08:00
    const ISODATE_NO_MS_REGEXP = new RegExp('^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+08:00$');  // second (millisecond): (\d{2}(?:\.\d*)?) --> (\d{2})
    const ISODATE_DATE_REGEXP = new RegExp('^(\d{4})-(\d{2})-(\d{2})');
    const HH_00 = new RegExp('(\d{2}):00');

    const received_space_reservations = req.body.space_reservations;
    const received_item_reservations = req.body.item_reservations;

    // check
    if(received_space_reservations.length + received_item_reservations.length <= 0) {
        res.status(400)
           .json({ error : 'Item_Reservation Quantity Error' });
        //return; ???
    }
    if(!EMAIL_REGEXP.test(req.body.email)) {
        res.status(400)
           .json({ error : 'Email Format Error' });
        //return; ???
    }
    if(!ISODATE_REGEXP.test(req.body.submit_time)) {
        res.status(400)
           .json({ error : 'Submit_Time Format Error' });
        //return; ???
    }
    //TODO: check organization (not null)
    //TODO: check contact (not null)

    // start process data
    const reservation_id = ObjectID();
    let data_space_reservations = [];
    let data_item_reservations = [];

    // for spaces_reserved_time
    received_space_reservations.forEach(element => {
        // check
        if(!ISODATE_NO_MS_REGEXP.test(element.start_time)) {
            res.status(400)
               .json({ error : 'Space_Reservation Start_Time Format Error' });
            //return; ???
        }
        if(!HH_00.test(element.duration)) { //check it in the same day or <24h ?
            res.status(400)
               .json({ error : 'Space_Reservation Duration Format Error' });
            //return; ???
        }
        //TODO: check whether space_id is exist
        // process data
        let duration = parseInt(element.duration.substring(0, 2), 10);  // decimal integer from the substring
        let unshifted_time = new Date(element.start_time);
        let shifted_time;
        for(let i=0; i<duration; i++) {
            shifted_time = (new Date(unshifted_time)).setHours(unshifted_time.getHours()+i);  // getHours --> shift --> set back
            data_space_reservations.push({
                time_slot: shifted_time, // unit: hour
                reservations_id: reservation_id
            });
        }
    });

    // for items_reserved_time
    received_item_reservations.forEach(element => {
        // check
        if(!ISODATE_DATE_REGEXP.test(element.start_date)) {
            res.status(400)
               .json({ error : 'Item_Reservation Start_Date Format Error' });
            //return; ???
        }
        if(!ISODATE_DATE_REGEXP.test(element.end_date)) {
            res.status(400)
               .json({ error : 'Item_Reservation End_Date Format Error' });
            //return; ???
        }
        //TODO: check whether item_id is exist
        
        // process data
        //  get duration (days)
        const start_date = new Date(element.start_date);
        const end_date = new Date(element.end_date);
        let duration = (end_date.getTime() - start_date.getTime()) / (1000*60*60*24);  // from millisecond to days
        //  define variables
        let unshifted_date = new Date(element.start_date);
        let shifted_date;
        //  loop
        for(let i=0; i<duration; i++) {
            shifted_date = (new Date(unshifted_date)).setDate(unshifted_date.getDate()+i);
            data_item_reservations.push({
                date: shifted_date, //noon-to-noon, here's the 1st day
                reservations_id: reservation_id
            });
        }
    });

    // for reservations
    const doc = {
        _id: reservation_id,
        status: "new",  // new/canceled
        history: [
            {
                submit_timestamp: ISODate(req.body.submit_time), //
                server_timestamp: new Timestamp(),
                type: "new",  // new/modify/cancel
            }
        ],
        organization: req.boty.organization,
        contact: req.body.contact,
        email: req.body.email,  //checked
        space_reservations: received_space_reservations,
        item_reservations: received_item_reservations,
        note: req.body.note
    }
    const reservations_result = await reservations.insertOne(doc);
    const spaces_reserved_time_result = await spaces_reserved_time.insertMany(data_space_reservations);
    const items_reserved_time_result = await items_reserved_time.insertMany(data_item_reservations);
    //result.insertedId
    //reservation_id
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