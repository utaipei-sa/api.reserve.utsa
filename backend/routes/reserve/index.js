const reserve_router = require('express').Router();

const root = '/reserve';

reserve_router.use(root, require('./GET_items'));
reserve_router.use(root, require('./GET_spaces'));
reserve_router.use(root, require('./GET_integral_space_availability'));
reserve_router.use(root, require('./GET_interval_space_availability'));
reserve_router.use(root, require('./GET_integral_item_availability'));
reserve_router.use(root, require('./GET_interval_item_availability'));
reserve_router.use(root, require('./GET_reservation'));
reserve_router.use(root, require('./POST_reservation'));
reserve_router.use(root, require('./PUT_reservation'));
reserve_router.use(root, require('./DELETE_reservation'));

module.exports = reserve_router;