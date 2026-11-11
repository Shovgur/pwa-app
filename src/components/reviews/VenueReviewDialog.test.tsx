import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { VenueReviewDialog } from './VenueReviewDialog'

vi.mock('../../lib/venueReviews', async () => {
  const actual = await vi.importActual<typeof import('../../lib/venueReviews')>('../../lib/venueReviews')
  return {
    ...actual,
    createVenueReview: vi.fn(async () => undefined),
  }
})

describe('VenueReviewDialog', () => {
  it('требует оценку перед отправкой', async () => {
    const user = userEvent.setup()
    render(
      <VenueReviewDialog
        open
        bookingId="1"
        venueName="Корт"
        onClose={() => {}}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Отправить отзыв' }))
    expect(screen.getByText(/Поставьте оценку/i)).toBeInTheDocument()
  })

  it('звёзды доступны с клавиатуры (radio)', () => {
    render(
      <VenueReviewDialog
        open
        bookingId="1"
        venueName="Корт"
        onClose={() => {}}
      />,
    )
    expect(screen.getAllByRole('radio', { name: '1 из 5' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('radio', { name: '5 из 5' }).length).toBeGreaterThanOrEqual(1)
  })
})
