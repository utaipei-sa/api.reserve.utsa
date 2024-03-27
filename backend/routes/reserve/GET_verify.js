const express = require('express')
const { reservations } = require('../../models/mongodb')
const router = express.Router()

/**
 * @openapi
 * /reserve/verify:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 驗證預約紀錄
 *     description: 驗證預約紀錄
 *     operationId: GetVerify
 *     responses:
 *       '200':
 *         description: OK
 */
router.get('/verify', async function(req, res, next) {
    // const data = await spaces
    //     .find({})
    //     .project({ _id: 1, name: 1, open: 1, exception_time: 1 })
    //     .toArray( function(err, results) {
    //         console.log(results)
    //     })


    // find reservation from reservations (db collection) by id

    // update verify from 0 to 1

    res.json({ message: 'success!' })
})

module.exports = router