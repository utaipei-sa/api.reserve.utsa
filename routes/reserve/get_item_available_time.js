import express from 'express'
import { items,items_reserved_time } from '../../models/mongodb.js'

const router = express.Router()

router.get('/reservation/:item_id',async function(req, res,next){
    const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ //item_id format
    const DATETIME_MINUTE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/ //date format
    const item_id = req.params.item_id
    const intervals = req.query.intervals
    const start_time = req.query.start_time
    const end_time = req.query.end_time

    if (item_id === undefined || start_time === undefined || end_time === undefined) { 
        res
          .status(400)
          .json({ error: 'space_id, start_datetime, and end_datetime are required' })
        return
    }

    if (!OBJECT_ID_REGEXP.test(item_id)) {
        res
          .status(400)
          .json({ error: 'object_id format error' })
        return
    }

    if(!DATETIME_MINUTE_REGEXP.test(start_time) || !DATETIME_MINUTE_REGEXP.test(end_time)) {
        res
          .status(400)
          .json({ error: 'Date format error' })
        return
    }

    if(intervals===undefined) intervals = "false"

    if(intervals.toLowerCase === "true" )
    {
        
    }
    else if(intervals.toLowerCase === "false")
    {
        
    }
    else
    {
        res
          .status(400)
          .json({ error: 'interval error' })
        return
    }
})

export default router