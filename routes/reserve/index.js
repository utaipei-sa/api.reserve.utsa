import express from 'express'

import getItem from './get_item.js'
import getItems from './get_items.js'
import getSpace from './get_space.js'
import getSpaces from './get_spaces.js'
import getItemAvailableTime from './get_item_available_time.js'
import getReserve from './get_reserve.js'
import putReserve from './put_reserve.js'
import deleteReserve from './delete_reserve.js'
import postReserve from './post_reserve.js'
import getSpaceAvailableTime from './get_space_available_time.js'
import patchVerify from './patch_verify.js'

const reserve_router = express.Router()
const root = '/reserve'

async function useRouters () {
  reserve_router.use(root, getItem)
  reserve_router.use(root, getItems)
  reserve_router.use(root, getSpace)
  reserve_router.use(root, getSpaces)
  reserve_router.use(root, getItemAvailableTime)
  reserve_router.use(root, getReserve)
  reserve_router.use(root, putReserve)
  reserve_router.use(root, deleteReserve)
  reserve_router.use(root, postReserve)
  reserve_router.use(root, getSpaceAvailableTime)
  reserve_router.use(root, patchVerify)
}
useRouters()

export default reserve_router
