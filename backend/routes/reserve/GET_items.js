const express = require('express')
const { items } = require('../../models/mongodb')
const router = express.Router()

/**
 * @openapi
 * /reserve/items:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 取得物品清單
 *     description: 取得物品清單
 *     operationId: GetItems
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: 物品清單
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 */
router.get('/items', async function(req, res, next) {
    const data = await items
        .find({})
        .project({ _id: 1, name: 1, quantity: 1, exception_time: 1 })
        .toArray( function(err, results) {
            console.log(results)
        })
    res.json({ data: data })
})

module.exports = router