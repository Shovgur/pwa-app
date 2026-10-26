/** Публичные документы BookinGo — только PDF на скачивание. */

export const LEGAL_PDFS = [
  {
    href: '/docs/politika-bookingo.pdf',
    label: 'Политика конфиденциальности',
    download: 'Politika-konfidencialnosti-BookinGo.pdf',
  },
  {
    href: '/docs/oferta-bookingo.pdf',
    label: 'Оферта',
    download: 'Publichnaya-oferta-BookinGo.pdf',
  },
] as const

export const FOOTER_LEGAL_LINKS = [
  ...LEGAL_PDFS.map((doc) => ({
    href: doc.href,
    label: doc.label,
    download: doc.download,
  })),
  { href: '/requisites', label: 'Реквизиты', download: null },
] as const
