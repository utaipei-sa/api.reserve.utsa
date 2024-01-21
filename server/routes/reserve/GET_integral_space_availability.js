var express = require('express');
var { spaces, spaces_reserved_time } = require('../../models/mongodb');
var router = express.Router();

router.get('/integral_space_availability', async function(req, res, next) {
    const space_id = req.params.space_id;
    const start_datetime = req.params.start_datetime;
    const end_datetime = req.params.end_datetime;

    // TODO: 檢查輸入是否正確
    // res.status(404).json({ error: '參數輸入錯誤' });

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