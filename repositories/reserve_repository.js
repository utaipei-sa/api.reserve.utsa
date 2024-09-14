import { ObjectId } from 'mongodb'
import { reservations } from '../models/mongodb.js'
class ReserveRepository {
  getReserveById = async (/** @type {string} */ id) => {
    return await reservations.findOne({
      _id: { $eq: new ObjectId(id) }
    })
  }

  deleteReserveById = async (/** @type {string} */ id) => {
    return await reservations.deleteMany({ _id: new ObjectId(id) })
  }

  insertReserve = async (/** @type {Object} */ doc) => {
    await reservations.insertOne(doc)
  }

  updateReserveById = async (
    /** @type {string} */ id,
    /** @type {object} */ reservation
  ) => {
    await reservations.updateOne(
      { _id: new ObjectId(id) },
      { $set: reservation }
    )
  }

  updateVerifyById = async (/** @type {string} */ id) => {
    await reservations.updateOne(
      { _id: new ObjectId(id) },
      { $set: { verify: 1 } }
    )
  }
}

export default new ReserveRepository()
