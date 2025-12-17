// __tests__/components/Spinner.test.tsx
import { render, screen } from '@testing-library/react'
import Spinner from '@/components/Spinner'

describe('Spinner', () => {
  it('renders without crashing', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has spinner element', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Spinner className="my-custom-class" />)
    expect(container.firstChild).toHaveClass('my-custom-class')
  })

  it('has sr-only text for accessibility', () => {
    render(<Spinner />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toHaveClass('sr-only')
  })
})