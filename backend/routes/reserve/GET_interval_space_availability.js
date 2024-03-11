const express = require('express');
const ObjectId = require('mongodb').ObjectId
const { spaces, spaces_reserved_time } = require('../../models/mongodb');
const router = express.Router();

/**
 * @openapi
 * /reserve/interval_space_availability:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 查詢特定範圍內各時段之場地是否可供借用
 *     description: 查詢特定範圍內各時段之場地是否可供借用
 *     operationId: GetIntervalSpaceAvailability
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SpaceAvailability'
 */
router.get('/interval_space_availability', async function(req, res, next) {
    // 正規表達式 Regular Expression
    const OBJECT_ID_REGEXP = /^[0-9a-fA-F]{24}$/  // ObjectId 格式: 652765ed3d21844635674e71
    const DATETIME_MINUTE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/  // 2024-03-03T22:25

    // 時段列表
    const time_slots = [
        { start: '08:00', end: '12:00' },
        { start: '13:00', end: '17:00' },
        { start: '18:00', end: '22:00' }
    ]

    // 取得輸入資料
    const space_id = req.query.space_id             // 場地 ID
    const start_datetime = req.query.start_datetime // 欲查詢區間之起始時間
    const end_datetime = req.query.end_datetime     // 欲查詢時間之終止時間

    let error_message = ''  // 錯誤訊息

    // 檢查輸入是否正確   
    if (space_id === undefined || start_datetime === undefined || end_datetime === undefined) {  // 沒給齊參數
        error_message += 'space_id, start_datetime, and end_datetime are required\n'
    }
    if (!OBJECT_ID_REGEXP.test(space_id)) {  // check space_id format
        error_message += 'space_id format error'
    }
    if (!DATETIME_MINUTE_REGEXP.test(start_datetime) || !DATETIME_MINUTE_REGEXP.test(end_datetime)) {  // check datetime fromat
        error_message += 'datetime format error'
    }
    if ((new Date(start_datetime)).getTime() > (new Date(end_datetime)).getTime()) {  // start_datetime > end_datetime
        error_message += 'end_datetime cannot be earlier than start_datetime'
    }
    if (error_message.length !== 0) {
        res
            .status(400)
            .json({ error: error_message})
        return
    }

    // 確認 space_id 是否有對應的場地，沒有就報錯
    let space_found = await spaces.findOne({ _id: new ObjectId(space_id) })
    if (!space_found) {
        res
            .status(400)
            .json({ error : 'space_id not found error' })
        return
    }

    // 統整場地可否借用資訊

    // 迴圈(日期) (條件: 正在處理的日期 <= end_datetime 的純日期(使用下方定義的 function 計算) )
    //     迴圈(時段)
    //         如果時間 <= 第 i 個時段的結束時間（使用 time_slots[i]['end'] 建立 Date 物件） 且 當日該時段的 start 時間 <= end_datetime
    //             加入時間區段
    //             進行查詢(還是要之後一次查詢?)
    //     日期 +1

    // ===============↓以下未整理↓===============

    const start_hh = start_datetime.substring(11, 13);
    const start_mm = start_datetime.substring(14, 16);  // 注意會不會 index out of range
    const end_hh = end_datetime.substring(11, 13);
    const end_mm = end_datetime.substring(14, 16);  // 注意會不會 index out of range
    var output = {data: []};
    var time_slot_index = 0;   // 從 reservable_time 的第幾個 index 開始列
    var end_time_slot_index = 0;
    var start_date_delta = 0;  // 時段計算要從 start_datetime 日期的幾天後開始
    var end_date_delta = 0;   // 結束日期是開始日期的幾天後

    // 判斷開始列的時段
    // if (Number(start_hh) < 12 && Number(start_mm) < 0) {  // 12:00 前，從 08:00 ~ 12:00 時段開始列
    //     time_slot_index = 0;
    // } else if (Number(start_hh) < 17 && Number(start_mm) < 0) {  // 17:00 前，從 13:00 ~ 17:00 時段開始列
    //     time_slot_index = 1;
    // } else if (Number(start_hh) < 22 && Number(start_mm) < 0) {  // 22:00 前，從 18:00 ~ 22:00 時段開始列
    //     time_slot_index = 2;
    // } else {  // 22:00 後，從 08:00 ~ 12:00 時段開始列
    //     time_slot_index = 0;
    //     start_date_delta = 1;
    // }

    var time_slot_index = (start_hh < 12) ? 0 :  // 12:00 前，從 08:00 ~ 12:00 時段開始列
                          (start_hh < 17) ? 1 :  // 17:00 前，從 13:00 ~ 17:00 時段開始列
                          (start_hh < 22) ? 2 : 0;  // 22:00 前，從 18:00 ~ 22:00 時段開始列
    var start_date_delta = (start_hh >= 22) ? 1 : 0;  // 22:00 後，從 08:00 ~ 12:00 時段開始列
    
    // 判斷列到哪個時段
    // if (Number(end_hh) < 12 && Number(end_mm) < 0) {  // 12:00 前，列到 08:00 ~ 12:00 時段
    //     end_time_slot_index = 0;
    // } else if (Number(end_hh) < 17 && Number(end_mm) < 0) {  // 17:00 前，列到 13:00 ~ 17:00 時段
    //     end_time_slot_index = 1;
    // } else if (Number(end_hh) < 22 && Number(end_mm) < 0) {  // 22:00 前，列到 18:00 ~ 22:00 時段
    //     end_time_slot_index = 2;
    // }
    var end_time_slot_index = (end_hh < 12) ? 0 :
                              (end_hh < 17) ? 1 : 2;
                            //(end_hh < 22) ? 2 : 0;
    
    // 計算 end_date_delta
    end_date_delta = calculate_date_delta(start_datetime.substring(0, 10), end_datetime.substring(0, 10));  // (YYYY-MM-DD, YYYY-MM-DD) -> number
    // 開始列時段
    var data_date;
    for (; start_date_delta <= end_date_delta; start_date_delta++) {  // date
        data_date = get_delta_date_datetime(start_datetime.substring(0, 10), start_date_delta);  // (YYYY-MM-DD, 位移幾天) -> YYYY-MM-DD
        for (; time_slot_index < 3; time_slot_index++) {  // 時段
            if ((start_date_delta == end_date_delta) && (time_slot_index > end_time_slot_index)) {  // 最後一天，時段超出範圍
                break;  // 停，不列了
            }
            output.data.push({
                start_datetime: `${data_date}T${time_slots[time_slot_index].start}`,
                end_datetime: `${data_date}T${time_slots[time_slot_index].end}`, 
                availablility: 1
            });
        }
        time_slot_index = 0;
    }
    
    // 查詢位於此查詢區間的資料庫資料
    const spaces_reservations = await spaces_reserved_time.find({ 
        _id: space_id, 
        start_date: {  // 時間範圍內
            $gte: new Date(start_datetime),  // query_start_datetime
            $lt: new Date(end_datetime)  // query_end_datetime
        }
    });
    // 依序將資料填入時段空格內
    spaces_reservations.forEach((reservation) => {
        var i = 0;
        for (i = 0; i < outputlength; i++) {  // 找到預約資料所在的時段
            if ((new Date(reservation.start_datetime)).getTime() > (new Date(output[i].start_datetime)).getTime()) {  // 資料開始時間 > 時段開始時間 TODO: and 資料結束時間(要用到 delta) < 時段結束時間
                if (reservation.reserved == 1) {  // 如果預約資料.reserved == 1 (被借用)
                    output[i].availability = 0;  // 輸出時段資料.availability = 0 (不可借用)
                }
            }
        }  
    });

    // 輸出
    res.json(output);
});

/**
 * 計算日期相差天數
 * @param {string} start_date_string Date 物件 1
 * @param {string} end_date_string Date 物件 2
 * @returns {number} 相差天數(整數)
 */
function calculate_date_delta(start_date_string, end_date_string) {
    var start_date = new Date(start_date_string)
    var end_date = new Date(end_date_string)
    var time_delta = end_date.getTime() - start_date.getTime()
    var day_delta = Math.round( time_delta / (1000 * 60 * 60 * 24) )
    return day_delta
}

/**
 * 計算位移指定天數的日期
 * @param {string} date_string 位移前的 Date 物件
 * @param {number} delta_date 位移天數
 * @returns {string}
 */
function get_delta_date_datetime(date_string, delta_date) {
    const day_milliseconds = 1000 * 60 * 60 * 24
    const date = new Date(date_string)
    const new_date = new Date(date.getTime() + (day_milliseconds * delta_date))
    return new_date
}

/**
 * 取得當日 00:00 的 Date 物件
 * @param {Date} date_with_time 帶有時間資訊的 Date 物件
 * @returns {Date} 當日 00:00 的 Date 物件
 */
function get_pure_date(date_with_time) {
    const day_milliseconds = 1000 * 60 * 60 * 24
    const date_ease_time_milliseconds = Math.floor( date_with_time.getTime() / day_milliseconds )
    const date_ease_time = new Date( date_ease_time_milliseconds )
    return date_ease_time
}

/**
 * 計算日期差異天數（不考慮時間）
 * @param {Date} start_datetime 較過去的日期
 * @param {Date} end_datetime 較未來的日期
 * @returns {number} 相減天數 
 */
function dates_substraction(start_datetime, end_datetime) {
    const day_milliseconds = 1000 * 60 * 60 * 24
    const start_date = get_pure_date(start_datetime)
    const end_date = get_pure_date(end_datetime)
    const days = Math.round( (end_date.getTime() - start_date.getTime()) / day_milliseconds )
    return days
}

module.exports = router;