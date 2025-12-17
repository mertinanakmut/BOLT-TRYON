// __tests__/components/Navbar.test.tsx
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  __esModule: true,
  default: () => ({
    auth: {
      getSession: jest.fn(() => 
        Promise.resolve({ 
          data: { session: null }, 
          error: null 
        })
      ),
    },
  }),
}))

describe('Navbar', () => {
  it('renders logo and navigation links', () => {
    render(<Navbar />)
    
    // Logo kontrolü
    expect(screen.getByText(/mert app/i)).toBeInTheDocument()
    
    // Navigation links
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /try-on/i })).toBeInTheDocument()
  })

  it('shows login button when user is not authenticated', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
  })
})