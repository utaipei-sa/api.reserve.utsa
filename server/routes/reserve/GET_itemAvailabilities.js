var express = require('express');
var { items, items_reserved_time } = require('../../models/mongodb');
var router = express.Router();

router.get('/itemAvailability/:item_id', async function(req, res, next) {
    const item_id = req.params.item_id;
    const start_datetime = req.params.start_datetime;
    const end_datetime = req.params.end_datetime;

    // TODO: 檢查輸入是否正確
    // res.status(404).json({ error: '參數輸入錯誤' });

    // 查詢物品資訊
    const item = await items.findOne({ _id: item_id });
    // TODO: 如果找不到物品
    // TODO:     回傳錯誤訊息
    const total_quantity = item.quantity;

    // 取得物品借用時段紀錄
    const item_reservations = await items_reserved_time.find({ 
        _id: item_id, 
        start_date: {
            $gte: new Date(start_datetime),  // query_start_datetime
            $lt: new Date(end_datetime)  // query_end_datetime
        } 
    });  // 時間範圍內

    // 統整物品可借數量資訊
    var min_available_quantity = total_quantity;
    for (i = 0; i < item_reservations.length; i++) {  
        if (total_quantity - item_reservations[i].quantity < min_available_quantity) {
            min_available_quantity = total_quantity - item_reservations[i].quantity;
        }  // 可出借數量取最小值
    }

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