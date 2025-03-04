import express from 'express'
import request from 'supertest'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import router from '../../../routes/reserve/get_items.js'
import ItemRepository from '../../../repositories/item_repository.js'

const app = express()
app.use(express.json())
app.use('/reserve', router)

describe('GET /reserve/items', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('should return all items data in DB', async () => {
    const mockItems = [
      {
        _id: '67399cd504b112e42be95b18',
        name: {
          'zh-tw': '塑膠椅',
          en: 'Plastic Chairs'
        },
        quantity: 30,
        exception_time: []
      },
      {
        _id: '67399cd504b112e42be95b19',
        name: {
          'zh-tw': '長桌',
          en: 'Tables'
        },
        quantity: 2,
        exception_time: []
      }
    ]
    jest.spyOn(ItemRepository, 'getAllItems').mockResolvedValue(mockItems)

    const response = await request(app).get('/reserve/items')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ data: mockItems })
  })
})
