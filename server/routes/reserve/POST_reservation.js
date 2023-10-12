var express = require('express');
var ObjectID = require('mongodb').ObjectId;
var { reservations, spaces_reserved_time, items_reserved_time, spaces, items } = require('../../models/mongodb');
//const { Timestamp } = require('mongodb');
var router = express.Router();

router.post('/reservation', async function(req, res, next) {
    const EMAIL_REGEXP = new RegExp('^[\\w-\\.\\+]+@([\\w-]+\\.)+[\\w-]{2,4}$');
    const ISODATE_REGEXP = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2}(?:\\.\\d*)?)\\+08:?00$');  // time zone: (((-|\+)(\d{2}):(\d{2})|Z)?) --> \+08:00
    const ISODATE_NO_MS_REGEXP = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})\\+08:?00$');  // second (millisecond): (\d{2}(?:\.\d*)?) --> (\d{2})
    const ISODATE_DATE_REGEXP = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})');
    const HH_00 = new RegExp('(\\d{2}):00');

    const received_space_reservations = req.body.space_reservations;
    const received_item_reservations = req.body.item_reservations;

    // check
    if(received_space_reservations.length + received_item_reservations.length <= 0) {
        res.status(400)
           .json({ error : 'Empty Reservation Error' });
        return;
    }
    if(!EMAIL_REGEXP.test(req.body.email)) {
        res.status(400)
           .json({ error : 'Email Format Error' });
        return;
    }
    if(!ISODATE_REGEXP.test(req.body.submit_time)) {
        res.status(400)
           .json({ error : 'Submit_Time Format Error' });
        return;
    }
    // check organization (not null)
    if(!req.body.organization) {
        res.status(400)
           .json({ error : 'Organization Empty Error' });
        return;
    }
    // check contact (not null)
    if(!req.body.contact) {
        res.status(400)
           .json({ error : 'Contact Empty Error' });
        return;
    }
    // check department_grade (not null)
    if(!req.body.department_grade) {
        res.status(400)
           .json({ error : 'Department_grade Empty Error' });
        return;
    }
    // check reason (not null)
    if(!req.body.reason) {
        res.status(400)
           .json({ error : 'Reason Empty Error' });
        return;
    }

    // start process data
    const reservation_id = new ObjectID();
    let data_space_reservations = [];
    let data_item_reservations = [];

    // space reservation process

    // for spaces_reserved_time
    received_space_reservations.forEach(element => {
        // check
        if(!ISODATE_NO_MS_REGEXP.test(element.start_time)) {
            res.status(400)
               .json({ error : 'Space_Reservation Start_Time Format Error' });
            return;
        }
        if(!HH_00.test(element.duration)) { //check it in the same day or <24h ?
            res.status(400)
               .json({ error : 'Space_Reservation Duration Format Error' });
            return;
        }
        // check whether space_id is exist
        /*
        let space_found = spaces.findOne({ _id: new ObjectID(element.space_id) });  //TODO: try to make it async --> move to #space-reservation-process
        console.log(space_found);
        if(!space_found) {
            res.status(400)
               .json({ error : 'Space_id Not Found Error' });
            return;
        }
        */
        // process data
        let duration = parseInt(element.duration.substring(0, 2), 10);  // decimal integer from the substring
        let unshifted_time = new Date(element.start_time);
        let shifted_time;
        for(let i=0; i<duration; i++) {
            shifted_time = new Date(new Date(unshifted_time).setHours(unshifted_time.getHours()+i));  // getHours --> shift --> set back
            data_space_reservations.push({
                space_id: element.space_id,
                time_slot: shifted_time, // unit: hour
                reservations_id: reservation_id
            });
        }
    });

    // item reservation process

    // for items_reserved_time
    received_item_reservations.forEach(element => {
        // check
        if(element.quantity <= 0) {
            res.status(400)
               .json({ error : 'Item_Reservation Quantity Error' });
            return;
        }
        if(!ISODATE_DATE_REGEXP.test(element.start_date)) {
            res.status(400)
               .json({ error : 'Item_Reservation Start_Date Format Error' });
            return;
        }
        if(!ISODATE_DATE_REGEXP.test(element.end_date)) {
            res.status(400)
               .json({ error : 'Item_Reservation End_Date Format Error' });
            return;
        }
        // check whether item_id is exist
        /*
        let item_found = items.findOne({ _id: new ObjectID(element.item_id) });  //TODO: try to make it async
        if(!item_found) {
            res.status(400)
               .json({ error : 'Item_id Not Found Error' });
            return;
        }
        */
        // get duration (days)
        const start_date = new Date(element.start_date);
        const end_date = new Date(element.end_date);
        let duration = (end_date.getTime() - start_date.getTime()) / (1000*60*60*24);  // from millisecond to days
        // define variables
        let unshifted_date = new Date(element.start_date);
        let shifted_date;
        // loop
        for(let i=0; i<duration; i++) {
            shifted_date = new Date(new Date(unshifted_date).setDate(unshifted_date.getDate()+i));
            data_item_reservations.push({
                item_id: element.item_id,
                date: shifted_date.toISOString().substring(0,10), //noon-to-noon, here's the 1st day
                reservations_id: reservation_id
            });
        }
    });

    /*
    // check reservation data number
    if(data_space_reservations.length + data_item_reservations.length <= 0) {
        res.status(400)
           .json({ error : 'Reservation Data Number Error' });
        return;
    }
    */

    // for reservations
    const doc = {
        _id: reservation_id,
        status: "new",  // new/canceled
        history: [
            {
                submit_timestamp: new Date(req.body.submit_time),
                server_timestamp: new Date(),  // now
                type: "new",  // new/modify/cancel
            }
        ],
        organization: req.body.organization,
        contact: req.body.contact,
        department_grade: req.body.department_grade,
        email: req.body.email,
        reason: req.body.reason,
        space_reservations: received_space_reservations,
        item_reservations: received_item_reservations,
        note: req.body.note
    }

    const reservations_result = await reservations.insertOne(doc);
    if(data_space_reservations.length > 0) {
        const spaces_reserved_time_result = await spaces_reserved_time.insertMany(data_space_reservations);
    }
    if(data_item_reservations.length > 0) {
        const items_reserved_time_result = await items_reserved_time.insertMany(data_item_reservations);
    }
    
    //result.insertedId
    //reservation_id
    //send email
    res.json({ message: 'Success!' });
});

module.exports = router;