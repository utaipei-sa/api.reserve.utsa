var express = require('express');
var { items } = require('../../models/mongodb');
var router = express.Router();
var email_obj = require('../../utilities/email')
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
 *               $ref: '#/components/schemas/Item'
 */
router.get('/items', async function(req, res, next) {
    const data = await items.find({})
                             .project({ _id: 1, name: 1, quantity: 1})
                             .toArray(function(err, results){
                                 console.log(results);
                             });
    res.json({data: data});
    

});

module.exports = router;