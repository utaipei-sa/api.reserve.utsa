import express from 'express'
const reserve_router = express.Router()

const root = '/reserve'

async function useRouters () {
  reserve_router.use(root, (await import('./get_item.js')).default)
  reserve_router.use(root, (await import('./get_items.js')).default)
  reserve_router.use(root, (await import('./get_space.js')).default)
  reserve_router.use(root, (await import('./get_spaces.js')).default)
  reserve_router.use(root, (await import('./get_integral_space_availability.js')).default)
  reserve_router.use(root, (await import('./get_interval_space_availability.js')).default)
  reserve_router.use(root, (await import('./get_integral_item_availability.js')).default)
  reserve_router.use(root, (await import('./get_interval_item_availability.js')).default)
  reserve_router.use(root, (await import('./get_reservation.js')).default)
  reserve_router.use(root, (await import('./put_reserve.js')).default)
  reserve_router.use(root, (await import('./delete_reservation.js')).default)
  reserve_router.use(root, (await import('./get_verify.js')).default)
  reserve_router.use(root, (await import('./post_reserve.js')).default)
}

useRouters()

export default reserve_router
