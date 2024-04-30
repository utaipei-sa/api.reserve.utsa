import express from 'express'
import { items, items_reserved_time } from '../../models/mongodb.js'
import { ObjectId } from 'mongodb'
import dayjs from 'dayjs'

const router = express.Router()

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
router.get('/interval_item_availability', async function (req, res, next) {
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
  const item_id = req.query.item_id
  const start_datetime = req.query.start_datetime
  const end_datetime = req.query.end_datetime

  // 檢查輸入是否正確（正規表達式 Regular Expression）
  const objectId_format = /^[a-fA-F0-9]{24}$/ // ObjectId 格式
  const datetime_format = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/ // 日期時間格式（年-月-日T時:分）
  if (item_id === undefined || start_datetime === undefined || end_datetime === undefined) { // 沒給齊參數
    return res
      .status(400)
      .json({ error: 'item_id, start_datetime, and end_datetime are required' })
  } else if (!objectId_format.test(item_id)) { // check item_id format
    return res
      .status(400)
      .json({ error: 'item_id format error' })
  } else if (!datetime_format.test(start_datetime) || !datetime_format.test(end_datetime)) { // check datetime fromat
    return res
      .status(400)
      .json({ error: 'datetime format error' })
  }
  // 確認 item_id 是否有對應的場地，沒有就報錯
  const item_found = await items.findOne({ _id: new ObjectId(item_id) })
  if (!item_found) {
    res
      .status(400)
      .json({ error: 'item_id not found error' })
    return
  }
  // 統整物品可否借用資訊
  // const digical_time_slots = [
  //   { start: 12, end: 23 }
  // ]

  const output_array = []
  let end_datetime_dayjs = dayjs(end_datetime)
  let start_datetime_dayjs = dayjs(start_datetime)
  let maxValue = 0
  if (start_datetime_dayjs.hour() > 12) {
    start_datetime_dayjs = start_datetime_dayjs.set('hour', 12)
  } else if (start_datetime_dayjs.hour() < 12) {
    start_datetime_dayjs = start_datetime_dayjs.subtract(1, 'day').set('hour', 12)
  }
  if (end_datetime_dayjs.hour() > 12) {
    end_datetime_dayjs = end_datetime_dayjs.add(1, 'day').set('hour', 12)
  } else if (end_datetime_dayjs.hour() < 12) {
    end_datetime_dayjs = end_datetime_dayjs.set('hour', 12)
  }
  let available_quantity = 0
  while (start_datetime_dayjs.isBefore(end_datetime_dayjs)) {
    for (let count = 0; start_datetime_dayjs.isBefore(end_datetime_dayjs) && count <= 23; count++) {
      const item_database_info = await items_reserved_time.findOne({ start_datetime: new Date(start_datetime_dayjs.add(count, 'hour').format()), item_id: new ObjectId(item_id) })
      if (item_database_info == null) {
        continue
      }
      if (item_database_info.reserved > maxValue) {
        maxValue = item_database_info.reserved
      }
    }
    const items_quantity_info = await items.findOne({ _id: new ObjectId(item_id) })
    available_quantity = items_quantity_info.quantity - maxValue
    output_array.push({
      item_id,
      start_datetime: start_datetime_dayjs.format('YYYY-MM-DDTHH:mm'),
      end_datetime: start_datetime_dayjs.add(1, 'day').format('YYYY-MM-DDTHH:mm'),
      available_quantity

    })
    start_datetime_dayjs = start_datetime_dayjs.add(1, 'day')
    maxValue = 0
    available_quantity = 0
  }

  // while(start_datetime_dayjs.isBefore(end_datetime_dayjs)){
  //     for(let current_timeslot = 0;start_datetime_dayjs.isBefore(end_datetime_dayjs)&&current_timeslot<3;start_datetime_dayjs=start_datetime_dayjs.add(1,'hour')){

  //         //檢查start_datetime是在哪一個時段的
  //         if(start_datetime_dayjs.hour()>=digical_time_slots[current_timeslot].end){
  //             current_timeslot++;
  //             start_datetime_dayjs=start_datetime_dayjs.subtract(1,'hour');
  //             continue;
  //         }
  //         let reserved_quantity = 0;
  //         //在資料庫中是否有找到此時段的資料,如果否reserved_quantity=0
  //         const item_database_info = await items_reserved_time.findOne({ start_datetime: new Date(start_datetime_dayjs.format()), item_id: new ObjectId(item_id) });
  //         if ( item_database_info == null) {
  //             reserved_quantity = 0;
  //             console.log(item_id);
  //         }
  //         else {
  //             reserved_quantity = item_database_info.reserved;
  //             console.log(item_database_info.reserved);
  //         }

  //         if(start_datetime_dayjs.hour()>=digical_time_slots[current_timeslot].start&&start_datetime_dayjs.hour()<digical_time_slots[current_timeslot].end){
  //             output_array.push(
  //                 {
  //                     item_id: item_id,
  //                     start_datetime: start_datetime_dayjs.format("YYYY-MM-DDTHH:mm"),
  //                     end_datetime: start_datetime_dayjs.add(1, 'hour').format("YYYY-MM-DDTHH:mm"),
  //                     available_quantity: reserved_quantity
  //                 }
  //             );

  //         }
  //     }
  //     start_datetime_dayjs=start_datetime_dayjs.add(1,'day');
  //     start_datetime_dayjs=start_datetime_dayjs.set('hour',0).set('minute',0).set('second',0);
  // }
  res.json(output_array)
})

export default router
