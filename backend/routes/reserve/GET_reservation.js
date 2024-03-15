var express = require('express');
var ObjectID = require('mongodb').ObjectId;
var { reservations, spaces_reserved_time, items_reserved_time } = require('../../models/mongodb');
const dayjs = require('dayjs');
//const { Timestamp } = require('mongodb');
var router = express.Router();

/**
 * @openapi
 * /reserve/reservation/{reservation_id}:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 取得單筆預約紀錄
 *     description: 取得單筆預約紀錄
 *     operationId: GetReservation
 *     parameters:
 *       - name: reservation_id
 *         in: path
 *         description: 預約紀錄 ID
 *         required: true
 *         schema:
 *           type: string
 *           format: Object ID
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 */
router.get('/reservation/:reservation_id', async function(req, res, next) {
    //test area
    
    
    let start_datetime= new Date("2023-12-17T15:00:00");
    let end_datetime = new Date("2023-12-19T09:00:00");
    // 

    const digical_time_slots = [
        { start: 8, end: 12 },
        { start: 13, end: 17 },
        { start: 18, end: 22 }
    ]
    
    let store_cut_timeslot_array=[];
    let end_datetime_dayjs=dayjs(end_datetime);
    let start_datetime_dayjs=dayjs(start_datetime);
   
    while(start_datetime_dayjs.isBefore(end_datetime_dayjs)){
        for(let current_timeslot = 0;start_datetime_dayjs.isBefore(end_datetime_dayjs)&&current_timeslot<3;start_datetime_dayjs=start_datetime_dayjs.add(1,'hour')){

            //檢查start_datetime是在哪一個時段的
            if(start_datetime_dayjs.hour()>=digical_time_slots[current_timeslot].end){
                current_timeslot++;
                start_datetime_dayjs=start_datetime_dayjs.subtract(1,'hour');
                continue;
            }
            if(start_datetime_dayjs.hour()>=digical_time_slots[current_timeslot].start&&start_datetime_dayjs.hour()<digical_time_slots[current_timeslot].end){  
                store_cut_timeslot_array.push(
                    {   spaceID: 1 ,
                        start_time: new Date(start_datetime_dayjs.format()) ,
                        end_time : new Date(start_datetime_dayjs.add(1,'hour').format()),
                        aviliblty: false
                    }
                );
            }   
        }
        start_datetime_dayjs=start_datetime_dayjs.add(1,'day');
        start_datetime_dayjs=start_datetime_dayjs.set('hour',0).set('minute',0).set('second',0);
    }
    console.log(store_cut_timeslot_array);




    //-----------------------------------------------------------------------------------------------
    
    
    const objectId_format = new RegExp('^[a-fA-F0-9]{24}$');  // ObjectId 
    const reservation_id=req.params.reservation_id
    if(!objectId_format.test(reservation_id)){
        return res.status(400).json({ error: 'object_id format error' });
    }
    const result = await reservations.findOne({"_id": new ObjectID(req.params.reservation_id)});
    if(result === null){
        return res.status(400).json({ error: '請提供有效的預約紀錄ID' });
    }
    res.json(result);
 

});

module.exports = router;