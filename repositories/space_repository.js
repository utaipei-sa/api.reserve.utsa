import { ObjectId } from "mongodb";
import { spaces, spaces_reserved_time } from "../models/mongodb.js";
class SpaceRepository {
  findSpaceById = async (/** @type {String} */ id) => {
    return await spaces.findOne({
      _id: { $eq: new ObjectId(id) },
    });
  };

  getAllSpaces = async () => {
    return await spaces
      .find({})
      .project({ _id: 1, name: 1, open: 1, exception_time: 1 })
      .toArray();
  };

  findSlotByStartTime = async (
    /** @type {String} */ id,
    /** @type {string | number | Date} */ start_time
  ) => {
    return await spaces_reserved_time.findOne({
      start_datetime: {
        $eq: new Date(start_time),
      },
      space_id: { $eq: new ObjectId(id) },
      reserved: { $eq: 1 },
    });
  };

  getSlotsByTimeRange = async (
    /** @type {string} */ id,
    /** @type {string | number | Date} */ start_datetime,
    /** @type {string | number | Date} */ end_datetime
  ) => {
    return await spaces_reserved_time
      .find({
        space_id: { $eq: new ObjectId(id) },
        start_datetime: {
          $gte: new Date(start_datetime), // query start_datetime
          $lt: new Date(end_datetime), // query end_datetime
        },
        reserved: { $eq: 1 },
      })
      .toArray();
  };

  getSlotsByReservationId = async (/** @type {string} */ id) => {
    return await spaces_reserved_time
      .find({ reservations: { $in: [new ObjectId(id)] } })
      .toArray();
  };

  updateSlotDataById = async (
    /** @type {string | ObjectId} */ id,
    /** @type {string} */ reservation_id
  ) => {
    await spaces_reserved_time.updateOne(
      {
        _id: new ObjectId(id), // filter
      },
      {
        $set: {
          reserved: 0, // change data
        },
        $pull: {
          reservations: new ObjectId(reservation_id),
        },
      }
    );
  };

  deleteNonReservedSlots = async() =>{
    await spaces_reserved_time.deleteMany({ reserved: 0 })
  }

  getRemainingSlotsByStartTime = async (
    /** @type {string} */ id,
    /** @type {string | number | Date} */ start_datetime,
    /** @type {string} */ remaining_reservation_id
  ) => {
    return await spaces_reserved_time.findOne({
      start_datetime: { $eq: start_datetime },
      space_id: { $eq: id },
      reserved: { $eq: 1 },
      reservations: { $nin: [remaining_reservation_id] }
    })
  };
}

export default new SpaceRepository();
