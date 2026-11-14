/** Публичные юридические документы BookinGo — страницы на сайте. */

export const LEGAL_PAGES = [
  {
    href: '/legal/privacy',
    label: 'Политика конфиденциальности',
  },
  {
    href: '/legal/oferta',
    label: 'Оферта',
  },
  {
    href: '/legal/reviews',
    label: 'Правила отзывов',
  },
  {
    href: '/legal/consent',
    label: 'Согласие на ПДн',
  },
  {
    href: '/legal/partner-terms',
    label: 'Условия для партнёров',
  },
] as const

/** @deprecated PDF-файлы оставлены как архив; актуальные тексты — на /legal/* */
export const LEGAL_PDFS = [
  {
    href: '/docs/politika-bookingo.pdf',
    label: 'Политика (PDF, архив)',
    download: 'Politika-konfidencialnosti-BookinGo.pdf',
  },
  {
    href: '/docs/oferta-bookingo.pdf',
    label: 'Оферта (PDF, архив)',
    download: 'Publichnaya-oferta-BookinGo.pdf',
  },
] as const

export const FOOTER_LEGAL_LINKS = [
  ...LEGAL_PAGES.map((doc) => ({
    href: doc.href,
    label: doc.label,
    download: null as string | null,
  })),
  { href: '/requisites', label: 'Реквизиты', download: null as string | null },
]
