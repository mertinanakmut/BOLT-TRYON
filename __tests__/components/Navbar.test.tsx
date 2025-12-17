// __tests__/components/Navbar.test.tsx
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'

// Import mocks
import './mocks/supabase'
import './mocks/next-navigation'

// Mock the specific hook used in Navbar
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
  it('renders without crashing', () => {
    render(<Navbar />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('shows logo', () => {
    render(<Navbar />)
    expect(screen.getByText(/mert app/i)).toBeInTheDocument()
  })

  it('has navigation links', () => {
    render(<Navbar />)
    
    // Ana sayfa linki
    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
    
    // Try-on linki
    const tryonLink = screen.getByRole('link', { name: /try-on/i })
    expect(tryonLink).toBeInTheDocument()
    expect(tryonLink).toHaveAttribute('href', '/')
  })

  it('shows login button when not authenticated', () => {
    render(<Navbar />)
    const loginButton = screen.getByRole('link', { name: /login/i })
    expect(loginButton).toBeInTheDocument()
    expect(loginButton).toHaveAttribute('href', '/auth/login')
  })
})