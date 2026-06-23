import { DottedSurface } from '../ui/dotted-surface'

export function SiteAmbientBg() {
  return (
    <>
      <DottedSurface />
      <div className="site-ambient-mesh" aria-hidden />
    </>
  )
}
