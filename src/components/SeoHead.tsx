import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://bookingo.ru'
const DEFAULT_IMAGE = `${SITE_URL}/icon-512.png`

export interface SchemaVenue {
  name: string
  description: string
  address: string
  pricePerHour: number
  rating: number
  reviewCount?: number
  type: 'SportsActivityLocation' | 'EventVenue'
  url: string
}

interface SeoHeadProps {
  title: string
  description: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  schema?: SchemaVenue
}

export function SeoHead({ title, description, path = '/', image = DEFAULT_IMAGE, type = 'website', schema }: SeoHeadProps) {
  const fullTitle = title.includes('BookinGo') ? title : `${title} | BookinGo`
  const url = `${SITE_URL}${path}`

  const jsonLd = schema
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': schema.type,
        name: schema.name,
        description: schema.description,
        url: schema.url,
        address: {
          '@type': 'PostalAddress',
          addressLocality: schema.address,
          addressCountry: 'RU',
        },
        priceRange: `от ${schema.pricePerHour.toLocaleString()} ₽/час`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: schema.rating,
          bestRating: 5,
          reviewCount: schema.reviewCount ?? 12,
        },
        provider: {
          '@type': 'Organization',
          name: 'BookinGo',
          url: SITE_URL,
        },
      })
    : null

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{jsonLd}</script>
      )}
    </Helmet>
  )
}
