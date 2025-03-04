import express from 'express'
import request from 'supertest'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import router from '../../../routes/reserve/get_spaces.js'
import SpaceRepository from '../../../repositories/space_repository.js'

const app = express()
app.use(express.json())
app.use('/reserve', router)

describe('GET /reserve/spaces', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('should return all spaces data in DB', async () => {
    const mockSpaces = [
      {
        _id: '67399cd504b112e42be95b1a',
        name: {
          'zh-tw': '學生活動中心',
          en: 'Student Activity Center'
        },
        open: 1,
        exception_time: []
      },
      {
        _id: '67399cd504b112e42be95b1b',
        name: {
          'zh-tw': '勤樸樓B1小舞台',
          en: 'Cin-Pu Building B1 Stage'
        },
        open: 1,
        exception_time: []
      }
    ]
    jest.spyOn(SpaceRepository, 'getAllSpaces').mockResolvedValue(mockSpaces)

    const response = await request(app).get('/reserve/spaces')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ data: mockSpaces })
  })
})
