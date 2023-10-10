var express = require('express');
var { items } = require('../../models/mongodb');
var router = express.Router();

router.get('/items', async function(req, res, next) {
    const data = await items.find({})
                             .project({ _id: 1, name: 1, quantity: 1})
                             .toArray(function(err, results){
                                 console.log(results);
                             });
    res.json({data: data});
});

module.exports = router;