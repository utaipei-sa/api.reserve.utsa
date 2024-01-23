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
    const item_id = req.params.item_id;
    const start_datetime = req.params.start_datetime;
    const end_datetime = req.params.end_datetime;

    // 檢查輸入是否正確（正規表達式 Regular Expression）
    const objectId_format = new RegExp('^[a-fA-F0-9]{24}$');  // ObjectId 格式
    const datetime_format = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2})');  // 日期時間格式（年-月-日T時:分）
    if (!item_id || !isValidDateTime(start_datetime) || !isValidDateTime(end_datetime)) {  // 沒給齊參數
        return res.status(400).json({ error: '請提供有效的物品ID和有效的日期範圍（YYYY-MM-DDThh:mm格式）' });
    } 
    else if (!objectId_format.test(item_id)) {  // check item_id format
        return res.status(400).json({ error: 'item_id format error' });
    } 
    else if (!datetime_format.test(start_datetime) || !datetime_format.test(end_datetime)) {  // check datetime fromat
        return res.status(400).json({ error: 'datetime format error' });
    }

    // 查詢物品資訊
    const item = await items.findOne({ _id: item_id });//, function (error, impacts) {
    //     // 如果 item_id 查不到物品
    //     if (error) {
    //         res.status(404).json({ error: 'Item not found' });
    //     }
    // });
    //
    // if (!items) {
    //    return res.status(404).json({ error: '找不到指定的物品' });
    //  }
    const total_quantity = item.quantity;

    // 取得物品借用時段紀錄
    const item_reservations = await items_reserved_time.find({ 
        _id: item_id, 
        start_date: {
            $gte: new Date(start_datetime),  // query_start_datetime
            $lt: new Date(end_datetime)  // query_end_datetime
        } 
    });  // 時間範圍內

    // TODO: 統整物品可借數量資訊
    // var min_available_quantity = total_quantity;
    // for (i = 0; i < item_reservations.length; i++) {  
    //     if (total_quantity - item_reservations[i].quantity < min_available_quantity) {
    //         min_available_quantity = total_quantity - item_reservations[i].quantity;
    //     }  // 可出借數量取最小值
    // }

    // 輸出
    res.json({
        data:{
            "start_date": start_datetime,
            "end_date" : end_datetime,
            "available_quantity": min_available_quantity
        }
    });
});

module.exports = router;