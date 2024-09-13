import { ObjectId } from 'mongodb'
import { reservations } from '../models/mongodb.js'
class ReserveRepository {
  getReserveById = async (/** @type {string} */ id) => {
    return await reservations.findOne({
      _id: { $eq: new ObjectId(id) },
    });
  };

  deleteReserveById = async (/** @type {string} */ id) => {
    return await reservations.deleteMany({ _id: new ObjectId(id) });
  };

  insertReserve = async (/** @type {Object} */ doc) =>{
    await reservations.insertOne(doc);
  }
}

export default new ReserveRepository()
