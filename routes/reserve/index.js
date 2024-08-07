import express from 'express'
const reserve_router = express.Router()

const root = '/reserve'

async function useRouters () {
  reserve_router.use(root, (await import('./get_item.js')).default)
  reserve_router.use(root, (await import('./get_items.js')).default)
  reserve_router.use(root, (await import('./get_space.js')).default)
  reserve_router.use(root, (await import('./get_spaces.js')).default)
  reserve_router.use(root, (await import('./get_item_available_time.js')).default)
  reserve_router.use(root, (await import('./get_reserve.js')).default)
  reserve_router.use(root, (await import('./put_reserve.js')).default)
  reserve_router.use(root, (await import('./delete_reserve.js')).default)
  reserve_router.use(root, (await import('./post_reserve.js')).default)
  reserve_router.use(root, (await import('./get_space_available_time.js')).default)
  reserve_router.use(root, (await import('./patch_verify.js')).default)
}
useRouters()

export default reserve_router
