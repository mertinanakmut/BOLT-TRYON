// __tests__/api/health.test.ts
import { GET } from '@/app/api/health/route'
import { NextRequest } from 'next/server'

describe('Health API', () => {
  it('returns 200 and health status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      service: 'mert-app',
    })
  })
})