// __tests__/mocks/supabase.ts
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => 
          Promise.resolve({ 
            data: { id: '1', email: 'test@example.com' }, 
            error: null 
          })
        ),
      })),
      limit: jest.fn(() => 
        Promise.resolve({ 
          data: [], 
          error: null 
        })
      ),
    })),
    insert: jest.fn(() => 
      Promise.resolve({ 
        data: [{ id: 'new-id' }], 
        error: null 
      })
    ),
    update: jest.fn(() => 
      Promise.resolve({ 
        data: null, 
        error: null 
      })
    ),
    delete: jest.fn(() => 
      Promise.resolve({ 
        data: null, 
        error: null 
      })
    ),
  })),
  auth: {
    getSession: jest.fn(() => 
      Promise.resolve({ 
        data: { session: null }, 
        error: null 
      })
    ),
    signInWithPassword: jest.fn(() => 
      Promise.resolve({ 
        data: { user: null }, 
        error: null 
      })
    ),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
  },
}

// Supabase mock'u
jest.mock('@/lib/supabase/client', () => mockSupabaseClient)
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => mockSupabaseClient)
}))