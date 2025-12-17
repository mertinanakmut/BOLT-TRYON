// __tests__/lib/utils.test.ts
import { formatDate, validateEmail } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-12-17T10:00:00Z')
      expect(formatDate(date)).toBe('17.12.2024')
    })

    it('handles invalid date', () => {
      expect(formatDate('invalid')).toBe('Invalid Date')
    })
  })

  describe('validateEmail', () => {
    it('returns true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
    })

    it('returns false for invalid email', () => {
      expect(validateEmail('not-an-email')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
    })
  })
})