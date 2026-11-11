import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { VenueCard } from './VenueCard'

describe('VenueCard rating', () => {
  it('не показывает звезду без рейтинга', () => {
    const { container } = render(
      <MemoryRouter>
        <VenueCard
          to="/venue/1"
          badge="Спорт"
          title="Корт"
          location="Москва"
          price="1 000 ₽/час"
          rating={null}
          gradient="linear-gradient(#000,#111)"
        />
      </MemoryRouter>,
    )
    expect(container.querySelector('.venue-card-rating')?.textContent?.trim()).toBe('')
    expect(screen.queryByText(/4,/)).toBeNull()
  })
})
