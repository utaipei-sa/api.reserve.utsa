import express from 'express'
import request from 'supertest'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import router from './get_space.js'
import SpaceRepository from '../../repositories/space_repository.js'
import { R_ID_NOT_FOUND, R_INVALID_INFO } from '../../utilities/response.js'

const app = express()
app.use(express.json())
app.use('/reserve', router)

describe('GET /reserve/space/:space_id', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('should return 400 for invalid space_id format', async () => {
    const res = await request(app).get('/reserve/space/invalid-id')
    expect(res.statusCode).toBe(400)
    expect(res.body.error_code).toBe(R_INVALID_INFO)
    expect(res.body.message).toBe('space_id format error')
  })

  it('should return 404 if space not found', async () => {
    jest.spyOn(SpaceRepository, 'findSpaceById').mockResolvedValue(null)
    const validId = '507f1f77bcf86cd799439011'
    const res = await request(app).get(`/reserve/space/${validId}`)
    expect(res.statusCode).toBe(404)
    expect(res.body.error_code).toBe(R_ID_NOT_FOUND)
    expect(res.body.message).toBe('space_id not found')
  })

  it('should return space data for valid space id', async () => {
    const mockData = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Space',
      open: true,
      exception_time: ['2024-01-01T00:00:00.000Z']
    }
    jest.spyOn(SpaceRepository, 'findSpaceById').mockResolvedValue(mockData)
    const res = await request(app).get(`/reserve/space/${mockData._id}`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: mockData._id,
      name: mockData.name,
      open: mockData.open,
      exception_time: mockData.exception_time
    })
  })
})
