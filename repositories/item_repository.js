import { items, items_reserved_time } from '../models/mongodb.js'
import { ObjectId } from 'mongodb'
class ItemRepository {
  findItemById = async (id) => {
    return await items.findOne({
      _id: { $eq: new ObjectId(id) }
    })
  }

  getAllItems = async () => {
    return await items
      .find({})
      .project({ _id: 1, name: 1, quantity: 1, exception_time: 1 })
      .toArray()
  }

  findReservedSlotByTimeAndId = async (id, start_time) => {
    return await items_reserved_time.findOne({
      start_datetime: {
        $eq: new Date(start_time)
      },
      item_id: { $eq: id }
    })
  }
}

export default new ItemRepository()
