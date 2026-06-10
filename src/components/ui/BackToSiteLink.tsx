import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackToSiteLinkProps {
  className?: string
  variant?: 'default' | 'subtle' | 'sidebar'
}

export function BackToSiteLink({ className = '', variant = 'default' }: BackToSiteLinkProps) {
  return (
    <Link to="/" className={`back-to-site back-to-site--${variant} ${className}`.trim()}>
      <ArrowLeft size={16} />
      <span>На сайт</span>
    </Link>
  )
}
