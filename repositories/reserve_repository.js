import { ObjectId } from 'mongodb'
import { reservations } from '../models/mongodb.js'
class ReserveRepository {
    getReserveById =  async(/** @type {string} */ id)=>{
        return await reservations.findOne({
            _id: { $eq: new ObjectId(id) }
        })
    }
}

export default new ReserveRepository()
