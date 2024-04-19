import { items, spaces, reservations, items_reserved_time, spaces_reserved_time } from './mongodb.js'

export async function read_one_item (filter) {
  return await items.findOne(filter)
}
export async function read_many_items (filter) {
  return await items.find(filter).toArray()
}

export async function read_one_space (filter) {
  return await spaces.findOne(filter)
}
export async function read_many_sapces (filter) {
  return await spaces.find(filter).toArray()
}

export async function create_one_reservation (doc, options = undefined) {
  return await reservations.insertOne(doc, options)
}
export async function read_one_reservation (filter) {
  return await reservations.findOne(filter)
}
export async function update_one_reservation (filter, update, options = undefined) {
  return await reservations.updateOne(filter, update, options)
}
export async function delete_one_reservation (filter, options = undefined) {
  return await reservations.deleteOne(filter, options)
}

// export async function create_items_reserved_time() {

// }
// export async function read_items_reserved_time() {

// }
// export async function update_items_reserved_time() {

// }
// export async function delete_items_reserved_time() {

// }

// export async function create_spaces_reserved_time() {

// }
// export async function read_spaces_reserved_time() {

// }
// export async function update_spaces_reserved_time() {

// }
// export async function delete_spaces_reserved_time() {

// }
