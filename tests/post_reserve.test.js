import { jest, describe, it, expect } from '@jest/globals'
import request from 'supertest'
import { spaces, items } from '../models/mongodb.js'

jest.unstable_mockModule('../utilities/email/email.js', () => ({
  default: jest.fn()
}))
const app = (await import('../app.js')).default

const endpoint_url = '/api/v1/reserve/reserve'

describe(endpoint_url, () => {
  it('Success reservation', async () => {
    const space = await spaces.findOne({ 'name.zh-tw': '學生活動中心' })
    const item = await items.findOne({ 'name.zh-tw': '塑膠椅' })
    const res = await request(app)
      .post(endpoint_url)
      .send({
        submit_datetime: '2024-03-02T21:59:43.000+08:00',
        name: '王小名',
        department_grade: '資科二',
        organization: '學生會',
        email: 'u123456789@go.utaipei.edu.tw',
        reason: '舉辦迎新大會',
        space_reservations: [
          {
            space_id: space._id,
            start_datetime: '2024-01-23T18:00:00.000+08:00',
            end_datetime: '2024-01-25T22:00:00.000+08:00'
          }
        ],
        item_reservations: [
          {
            item_id: item._id,
            start_datetime: '2024-01-23T18:00:00.000+08:00',
            end_datetime: '2024-01-25T22:00:00.000+08:00',
            quantity: 15
          }
        ],
        note: '無'
      })
    console.log(res.body)

    expect(res.statusCode).toEqual(200)
  })
})
