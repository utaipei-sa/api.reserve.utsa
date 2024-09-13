import { items, items_reserved_time } from "../models/mongodb.js";
import { ObjectId } from "mongodb";
class ItemRepository {
  findItemById = async (/** @type {string} */ id) => {
    return await items.findOne({
      _id: { $eq: new ObjectId(id) },
    });
  };

  getAllItems = async () => {
    return await items
      .find({})
      .project({ _id: 1, name: 1, quantity: 1, exception_time: 1 })
      .toArray();
  };

  findSlotByStartTime = async (
    /** @type {string} */ id,
    /** @type {string | number | Date} */ start_time
  ) => {
    return await items_reserved_time.findOne({
      start_datetime: {
        $eq: new Date(start_time),
      },
      item_id: { $eq: new ObjectId(id) },
    });
  };

  getSlotByReservationId = async (/** @type {string} */ id) => {
    return await items_reserved_time
      .find({ reservations: { $in: [new ObjectId(id)] } })
      .toArray();
  };

  updateSlotDataById = async (
    /** @type {string | ObjectId} */ id,
    /** @type {number} */ quantity,
    /** @type {string} */ reservation_id
  ) => {
    await items_reserved_time.updateOne(
      {
        _id: new ObjectId(id), // filter
      },
      {
        $set: {
          reserved_quantity: quantity, // change data
        },
        $pull: {
          reservations: reservation_id,
        },
      }
    );
  };

  deleteZeroQuantitySlots = async () => {
    await items_reserved_time.deleteMany({ reserved_quantity: 0 });
  };

  findSlotByTimeRange = async (
    /** @type {string} */ id,
    /** @type {string | number | Date} */ start_datetime,
    /** @type {string | number | Date} */ end_datetime
  ) => {
    return await items_reserved_time.findOne({
      item_id: { $eq: new ObjectId(id) },
      start_datetime: {
        $eq: new Date(start_datetime),
      },
      end_datetime: { $eq: new Date(end_datetime) },
    });
  };
}

export default new ItemRepository();
