import type {
  PartnerVenueReview,
  PendingVenueReview,
  PublicVenueReview,
  VenueReviewSummary,
} from '../../lib/venueReviews'

const demoPublic: PublicVenueReview[] = []
const demoPending: PendingVenueReview[] = []
const demoPartner: PartnerVenueReview[] = []

export function demoFetchPublicVenueReviews(_venueId: string): PublicVenueReview[] {
  void _venueId
  return [...demoPublic]
}

export function demoFetchPublicVenueReviewSummary(_venueId: string): VenueReviewSummary {
  void _venueId
  return { ratingAvg: null, ratingCount: 0 }
}

export function demoFetchPendingVenueReviews(): PendingVenueReview[] {
  return [...demoPending]
}

export function demoCreateVenueReview(_input: {
  bookingId: number | string
  rating: number
  tags: string[]
  text: string
}): void {
  void _input
}

export function demoDeleteOwnVenueReview(_reviewId: string): void {
  void _reviewId
}

export function demoFetchPartnerVenueReviews(_opts?: {
  venueId?: string
  status?: string
  replied?: boolean
}): PartnerVenueReview[] {
  void _opts
  return [...demoPartner]
}

export function demoReplyPartnerVenueReview(_reviewId: string, _text: string): void {
  void _reviewId
  void _text
}
