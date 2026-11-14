export interface LegalSection {
  heading?: string
  /** Якорь для ссылки из баннера cookie, например cookies. */
  anchor?: string
  paragraphs: string[]
}

export interface LegalDocument {
  id: string
  slug: string
  title: string
  description: string
  sections: LegalSection[]
}
