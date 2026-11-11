import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { describe, expect, it } from 'vitest'
import { SeoHead } from './SeoHead'

describe('SeoHead aggregateRating', () => {
  it('не пишет aggregateRating без реальных отзывов', () => {
    render(
      <HelmetProvider>
        <SeoHead
          title="T"
          description="D"
          schema={{
            name: 'Venue',
            description: 'Desc',
            address: 'Moscow',
            pricePerHour: 1000,
            rating: null,
            reviewCount: 0,
            type: 'SportsActivityLocation',
            url: 'https://bookingo.ru/venue/1',
          }}
        />
      </HelmetProvider>,
    )
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    const raw = Array.from(scripts).map((s) => s.textContent ?? '').join('')
    expect(raw).not.toContain('aggregateRating')
    expect(raw).not.toContain('"reviewCount":12')
  })

  it('пишет aggregateRating при count≥1', () => {
    render(
      <HelmetProvider>
        <SeoHead
          title="T"
          description="D"
          schema={{
            name: 'Venue',
            description: 'Desc',
            address: 'Moscow',
            pricePerHour: 1000,
            rating: 4.5,
            reviewCount: 3,
            type: 'SportsActivityLocation',
            url: 'https://bookingo.ru/venue/1',
          }}
        />
      </HelmetProvider>,
    )
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    const raw = Array.from(scripts).map((s) => s.textContent ?? '').join('')
    expect(raw).toContain('aggregateRating')
    expect(raw).toContain('"reviewCount":3')
  })
})
