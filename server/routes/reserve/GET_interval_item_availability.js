var express = require('express');
var { items, items_reserved_time } = require('../../models/mongodb');
var router = express.Router();

/**
 * @openapi
 * /reserve/interval_item_availability:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 查詢特定範圍內各時段之物品可借數量
 *     description: 查詢特定範圍內各時段之物品可借數量
 *     operationId: GetIntervalItemAvailability
 *     parameters:
 *       - name: item_id
 *         in: query
 *         description: 物品 ID
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ItemAvailability'
 */
router.get('/interval_item_availability', async function(req, res, next) {
    // input:
    //     item_id: string
    //     start_datetime: YYYY-MM-DDThh:mm
    //     end_datetime: YYYY-MM-DDThh:mm
    // output:
    //     {
    //         data:{
    //             start_date: YYYY-MM-DDThh:mm,
    //             end_date : YYYY-MM-DDThh:mm,
    //             available_quantity: integer
    //         }
    //     }

    // 取得參數
    const item_id = req.query.item_id;
    const start_datetime = req.query.start_datetime;
    const end_datetime = req.query.end_datetime;

    // 檢查輸入是否正確（正規表達式 Regular Expression）
    const objectId_format = new RegExp('^[a-fA-F0-9]{24}$');  // ObjectId 格式
    const datetime_format = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2})');  // 日期時間格式（年-月-日T時:分）
    if (item_id === undefined || start_datetime === undefined || end_datetime === undefined) {  // 沒給齊參數
        return res.status(400).json({ error: '請提供有效的物品ID和有效的日期範圍（YYYY-MM-DDThh:mm格式）' });
    } 
    else if (!objectId_format.test(item_id)) {  // check item_id format
        return res.status(400).json({ error: 'item_id format error' });
    } 
    else if (!datetime_format.test(start_datetime) || !datetime_format.test(end_datetime)) {  // check datetime fromat
        return res.status(400).json({ error: 'datetime format error' });
    }

    // 統整物品可否借用資訊
    // 列出欲查詢的所有時段

    // 時段的部分我不知道該怎麼用，就選擇性的複製貼上，煩請學長檢查一下有無問題
    var output = {data: []};
    var time_slot_index = 0;   // 從 reservable_time 的第幾個 index 開始列
    var end_time_slot_index = 0;
    var start_date_delta = 0;  // 時段計算要從 start_datetime 日期的幾天後開始
    var end_date_delta = 0;   // 結束日期是開始日期的幾天後

    // 計算 end_date_delta
    end_date_delta = calculate_date_delta(start_datetime.substring(0, 10), end_datetime.substring(0, 10));  // (YYYY-MM-DD, YYYY-MM-DD) -> number
    // 開始列時段
    var data_date;
    for (; start_date_delta <= end_date_delta; start_date_delta++) {  // date
        data_date = get_delta_date_datetime(start_datetime.substring(0, 10), start_date_delta);  // (YYYY-MM-DD, 位移幾天) -> YYYY-MM-DD
        tomorrow_date = get_delta_date_datetime(start_datetime.substring(0, 10), start_date_delta++); // 取得隔天的日期 
        for (; time_slot_index < 3; time_slot_index++) {  // 時段
            if ((start_date_delta == end_date_delta) && (time_slot_index > end_time_slot_index)) {  // 最後一天，時段超出範圍
                break;  // 停，不列了
            }
            output.data.push({
                start_datetime: `${data_date}T12:00`,   // 第一天的12:00
                end_datetime: `${tomorrow_date}T11:59`, // 第二天的11:59
                availablility: 1
            });
        }
        time_slot_index = 0;
    }

    // 查詢位於此查詢區間的資料庫資料
    const items_reservations = await items_reserved_time.find({ 
        _id: item_id, 
        start_date: {  // 時間範圍內
            $gte: new Date(start_datetime),  // query_start_datetime
            $lt: new Date(end_datetime)  // query_end_datetime
        }
    });
    // 依序將資料填入時段空格內
    items_reservations.forEach((reservation) => {
        var i = 0;
        for (i = 0; i < outputlength; i++) {  // 找到預約資料所在的時段
            if ((new Date(reservation.start_datetime)).getTime() > (new Date(output[i].start_datetime)).getTime()) {  // 資料開始時間 > 時段開始時間 TODO: and 資料結束時間(要用到 delta) < 時段結束時間
                if (reservation.reserved == 1) {  // 如果預約資料.reserved == 1 (被借用)
                    output[i].availability = 0;  // 輸出時段資料.availability = 0 (不可借用)
                }
            }
        }  
    });

    // // 查詢物品資訊
    // const item = await items.findOne({ _id: item_id });//, function (error, impacts) {
    // //     // 如果 item_id 查不到物品
    // //     if (error) {
    // //         res.status(404).json({ error: 'Item not found' });
    // //     }
    // // });
    // //
    // // if (!items) {
    // //    return res.status(404).json({ error: '找不到指定的物品' });
    // //  }
    // const total_quantity = item.quantity;

    // // 取得物品借用時段紀錄
    // const item_reservations = await items_reserved_time.find({ 
    //     _id: item_id, 
    //     start_date: {
    //         $gte: new Date(start_datetime),  // query_start_datetime
    //         $lt: new Date(end_datetime)  // query_end_datetime
    //     } 
    // });  // 時間範圍內

    // // TODO: 統整物品可借數量資訊
    // // var min_available_quantity = total_quantity;
    // // for (i = 0; i < item_reservations.length; i++) {  
    // //     if (total_quantity - item_reservations[i].quantity < min_available_quantity) {
    // //         min_available_quantity = total_quantity - item_reservations[i].quantity;
    // //     }  // 可出借數量取最小值
    // // }

    // 輸出
    res.json({
        data:{
            "start_date": start_datetime,
            "end_date" : end_datetime,
            "available_quantity": min_available_quantity
        }
    });
});

// 計算日期相差幾天 -> number
function calculate_date_delta(start_date_string, end_date_string) {
    var start_date = new Date(start_date_string);
    var end_date = new Date(end_date_string);
    var time_delta = end_date.getTime() - start_date.getTime();
    var day_delta = time_delta / (1000 * 60 * 60 * 24);
    return day_delta;
}

// 計算位移日期 -> string
function get_delta_date_datetime(date_string, delta_date) {
    const day_milliseconds = 1000 * 60 * 60 * 24;
    const date = new Date(date_string);
    const new_date = new Date(date.getTime() + (day_milliseconds * delta_date));
    return new_date;
}

module.exports = router;