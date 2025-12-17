// __tests__/components/PrimaryButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import PrimaryButton from '@/components/PrimaryButton'

describe('PrimaryButton', () => {
  it('renders button with text', () => {
    render(<PrimaryButton>Click Me</PrimaryButton>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<PrimaryButton onClick={handleClick}>Click</PrimaryButton>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when loading', () => {
    render(<PrimaryButton loading>Loading...</PrimaryButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows loading spinner when loading', () => {
    render(<PrimaryButton loading>Loading...</PrimaryButton>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<PrimaryButton className="my-class">Test</PrimaryButton>)
    expect(screen.getByRole('button')).toHaveClass('my-class')
  })
})