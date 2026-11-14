import type { LegalDocument } from './types'
import { CONSENT_DOC } from './consent'
import { OFERTA_DOC } from './oferta'
import { PARTNER_TERMS_DOC } from './partnerTerms'
import { PRIVACY_DOC } from './privacy'
import { REVIEWS_DOC } from './reviews'

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  OFERTA_DOC,
  PRIVACY_DOC,
  CONSENT_DOC,
  REVIEWS_DOC,
  PARTNER_TERMS_DOC,
]

export function getLegalDocument(slug: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((doc) => doc.slug === slug)
}
