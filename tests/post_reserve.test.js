import { jest, describe, it, expect, beforeAll } from '@jest/globals'
import request from 'supertest'
import { spaces, items, reservations, items_reserved_time, spaces_reserved_time } from '../models/mongodb.js'
import { R_SUCCESS, R_ID_NOT_FOUND, R_INVALID_RESERVATION } from '../utilities/response.js'

jest.unstable_mockModule('../utilities/email/email.js', () => ({
  default: jest.fn()
}))
const app = (await import('../app.js')).default

const endpoint_url = '/api/v1/reserve/reserve'

beforeAll(async () => {
  await reservations.deleteMany({})
  await items_reserved_time.deleteMany({})
  await spaces_reserved_time.deleteMany({})
})

describe(endpoint_url, () => {
  it('Success first reservation', async () => {
    const space = await spaces.findOne({ 'name.zh-tw': '學生活動中心' })
    const item = await items.findOne({ 'name.zh-tw': '塑膠椅' })
    const res = await request(app)
      .post(endpoint_url)
      .send({
        submit_datetime: '2024-03-02T21:59:43.000+08:00',
        name: 'tester',
        department_grade: '資科二',
        organization: '學生會',
        email: 'u123456789@go.utaipei.edu.tw',
        reason: '舉辦迎新大會',
        space_reservations: [
          {
            space_id: space._id,
            start_datetime: '2024-05-21T07:21:00.000+08:00',
            end_datetime: '2024-05-22T08:19:00.000+08:00'
          }
        ],
        item_reservations: [
          {
            item_id: item._id,
            start_datetime: '2024-04-21T07:21:00.000+08:00',
            end_datetime: '2024-04-22T08:19:00.000+08:00',
            quantity: 15
          }
        ],
        note: '無'
      })
    console.log(res.body)

    const reservation = await reservations.findOne({ name: 'tester' })
    await request(app)
      .patch('/api/v1/reserve/verify/' + reservation._id)
    expect(res.statusCode).toEqual(200)
    expect(res.body.code).toEqual(R_SUCCESS)
    expect(reservation.space_reservations[0].start_datetime).toEqual('2024-05-21T07:00:00.000+08:00')
    expect(reservation.space_reservations[0].end_datetime).toEqual('2024-05-21T09:00:00.000+08:00')
    expect(reservation.item_reservations[0].start_datetime).toEqual('2024-04-21T07:00:00.000+08:00')
    expect(reservation.item_reservations[0].end_datetime).toEqual('2024-04-22T09:00:00.000+08:00')
  })

  it('Time already been reserved', async () => {
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
            start_datetime: '2024-05-21T07:00:00.000+08:00',
            end_datetime: '2024-05-21T09:00:00.000+08:00'
          },
          {
            space_id: space._id,
            start_datetime: '2024-05-22T08:00:00.000+08:00',
            end_datetime: '2024-05-22T12:00:00.000+08:00'
          }
        ],
        item_reservations: [
          {
            item_id: item._id,
            start_datetime: '2024-04-21T07:00:00.000+08:00',
            end_datetime: '2024-04-21T09:00:00.000+08:00',
            quantity: 20
          },
          {
            item_id: item._id,
            start_datetime: '2024-04-22T08:00:00.000+08:00',
            end_datetime: '2024-04-22T12:00:00.000+08:00',
            quantity: 20
          }
        ],
        note: '無'
      })
    console.log(res.body)

    expect(res.statusCode).toEqual(400)
    expect(res.body.error_code).toEqual(R_INVALID_RESERVATION)
  })

  it('Success reservation on available time', async () => {
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
            start_datetime: '2024-05-20T23:59:00.000+08:00',
            end_datetime: '2024-05-21T07:00:00.000+08:00'
          },
          {
            space_id: space._id,
            start_datetime: '2024-05-22T09:00:00.000+08:00',
            end_datetime: '2024-05-22T21:00:00.000+08:00'
          }
        ],
        item_reservations: [
          {
            item_id: item._id,
            start_datetime: '2024-04-20T23:59:00.000+08:00',
            end_datetime: '2024-04-21T07:00:00.000+08:00',
            quantity: 15
          },
          {
            item_id: item._id,
            start_datetime: '2024-04-22T09:00:00.000+08:00',
            end_datetime: '2024-04-22T21:00:00.000+08:00',
            quantity: 15
          }
        ],
        note: '無'
      })
    console.log(res.body)

    expect(res.statusCode).toEqual(200)
    expect(res.body.code).toEqual(R_SUCCESS)
  })

  it('Item not found', async () => {
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
        ],
        item_reservations: [
          {
            item_id: item._id,
            start_datetime: '2024-01-23T18:00:00.000+08:00',
            end_datetime: '2024-01-25T22:00:00.000+08:00',
            quantity: 40
          }
        ],
        note: '無'
      })
    console.log(res.body)

    expect(res.statusCode).toEqual(400)
    expect(res.body.error_code).toEqual(R_INVALID_RESERVATION)
  })

  it('Reserve too many items', async () => {
    const space = await spaces.findOne({ 'name.zh-tw': '學生活動中心' })
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
            item_id: '123456781234567812345678',
            start_datetime: '2024-01-23T18:00:00.000+08:00',
            end_datetime: '2024-01-25T22:00:00.000+08:00',
            quantity: 15
          }
        ],
        note: '無'
      })
    console.log(res.body)

    expect(res.statusCode).toEqual(404)
    expect(res.body.error_code).toEqual(R_ID_NOT_FOUND)
  })

  it('Space reservation time repeated', async () => {
    const space = await spaces.findOne({ 'name.zh-tw': '學生活動中心' })
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
            start_datetime: '2024-05-25T08:00:00.000+08:00',
            end_datetime: '2024-05-25T12:00:00.000+08:00'
          },
          {
            space_id: space._id,
            start_datetime: '2024-05-25T10:00:00.000+08:00',
            end_datetime: '2024-05-25T14:00:00.000+08:00'
          }
        ],
        item_reservations: [
        ],
        note: '無'
      })
    console.log(res.body)

    expect(res.statusCode).toEqual(400)
    expect(res.body.error_code).toEqual(R_INVALID_RESERVATION)
  })
})
