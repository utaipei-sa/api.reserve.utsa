import { items, spaces, reservations, items_reserved_time, spaces_reserved_time } from './mongodb.js'


export async function read_one_item() {
  return await items.findOne({})
}
export async function read_many_items() {
  return await items.find({})
}

export async function read_one_space() {
  return await spaces.findOne({})
}
export async function read_many_sapces() {
  return await spaces.find({})
}


export async function create_reservation() {

}
export async function read_reservations() {

}
export async function update_reservation() {

}
export async function delete_reservation() {

}


export async function create_items_reserved_time() {

}
export async function read_items_reserved_time() {

}
export async function update_items_reserved_time() {

}
export async function delete_items_reserved_time() {

}

export async function create_spaces_reserved_time() {

}
export async function read_spaces_reserved_time() {

}
export async function update_spaces_reserved_time() {

}
export async function delete_spaces_reserved_time() {

}
