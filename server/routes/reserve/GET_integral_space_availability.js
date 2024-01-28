var express = require('express');
var { spaces, spaces_reserved_time } = require('../../models/mongodb');
var router = express.Router();

/**
 * @openapi
 * /reserve/integral_space_availability:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 查詢特定時段場地是否可供借用
 *     description: 查詢特定時段場地是否可供借用
 *     operationId: GetIntegralSpaceAvailability
 *     parameters:
 *       - name: space_id
 *         in: query
 *         description: 場地 ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: start_datetime
 *         in: query
 *         description: 查詢起始時間
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: end_datetime
 *         in: query
 *         description: 查詢終止時間
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpaceAvailability'
 */
router.get('/integral_space_availability', async function(req, res, next) {
    // input:
    //     space_id: string
    //     start_datetime: YYYY-MM-DDThh:mm
    //     end_datetime: YYYY-MM-DDThh:mm
    // output:
    //     {
    //         data:{
    //             start_date: YYYY-MM-DDThh:mm,
    //             end_date : YYYY-MM-DDThh:mm,
    //             availablility: 1(available) / 0(unavailable)
    //         }
    //     }

    // 取得參數
    const space_id = req.query.space_id;
    const start_datetime = req.query.start_datetime;
    const end_datetime = req.query.end_datetime;

    // 檢查輸入是否正確（正規表達式 Regular Expression）
    const objectId_format = new RegExp('^[a-fA-F0-9]{24}$');  // ObjectId 格式
    const datetime_format = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2})');  // 日期時間格式（年-月-日T時:分）
    if (space_id === undefined || start_datetime === undefined || end_datetime === undefined) {  // 沒給齊參數
        return res.status(400).json({ error: '請提供有效的場地ID和有效的日期範圍（YYYY-MM-DDThh:mm格式）' });
    } 
    else if (!objectId_format.test(space_id)) {  // check space_id format
        return res.status(400).json({ error: 'space_id format error' });
    } 
    else if (!datetime_format.test(start_datetime) || !datetime_format.test(end_datetime)) {  // check datetime fromat
        return res.status(400).json({ error: 'datetime format error' });
    }

    // 查詢場地資訊
    // const space = await spaces.findOne({ _id: space_id });
    // var space_availability = space.availability;
    
    // 取得場地預約時段紀錄
    const spaces_reservations = await spaces_reserved_time.find({ 
        _id: space_id, 
        start_date: {
            $gte: new Date(start_datetime),  // query_start_datetime
            $lt: new Date(end_datetime)  // query_end_datetime
        } 
    });  // 時間範圍內

    // 統整場地可否借用資訊
    var availability = 1;
    for (i = 0; i < spaces_reservations.length; i++) {  
        if (spaces_reservations[i].availability == 0) {
            availability = 0;
            break;
        }  // 可否出借場地
    }

    // 輸出
    res.json({
        data:{
            "start_date": start_datetime,
            "end_date" : end_datetime,
            "available_quantity": availability
        }
    });
});

module.exports = router;