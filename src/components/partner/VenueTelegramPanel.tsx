import { useState } from 'react'
import { Copy, Check, MessageCircle, Unplug } from 'lucide-react'
import {
  createTelegramLink,
  unlinkTelegram,
  type PartnerTelegramLinkStatus,
} from '../../lib/partnerTelegram'

export function VenueTelegramPanel({
  venueId,
  canConnect,
  canUnlink,
  link,
  onUpdated,
}: {
  venueId: string
  /** Manager of this venue — can create link code */
  canConnect: boolean
  /** Manager or owner */
  canUnlink: boolean
  link: PartnerTelegramLinkStatus | null
  onUpdated: (next: PartnerTelegramLinkStatus | null) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showCode, setShowCode] = useState(false)

  const linked = Boolean(link?.linked)
  const pendingCode = link?.pendingCode

  async function handleConnect() {
    setError('')
    setBusy(true)
    try {
      const next = await createTelegramLink(venueId)
      onUpdated(next)
      setShowCode(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать код')
    } finally {
      setBusy(false)
    }
  }

  async function handleUnlink() {
    setError('')
    setBusy(true)
    try {
      await unlinkTelegram(venueId)
      onUpdated({
        venueId,
        venueName: link?.venueName ?? null,
        staffId: null,
        linked: false,
        isActive: false,
        linkedAt: null,
        pendingCode: null,
        linkExpiresAt: null,
        botUsername: link?.botUsername ?? null,
        deepLink: null,
      })
      setShowCode(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отвязать')
    } finally {
      setBusy(false)
    }
  }

  async function copyCode() {
    const value = pendingCode || ''
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setError('Не удалось скопировать код')
    }
  }

  return (
    <div
      style={{
        marginTop: 12,
        padding: '12px 14px',
        borderRadius: 12,
        background: 'rgba(14, 165, 233, 0.08)',
        border: '1px solid rgba(14, 165, 233, 0.22)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <MessageCircle size={15} color="#38bdf8" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#e0f2fe' }}>Telegram</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              background: linked ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.12)',
              color: linked ? '#86efac' : '#94a3b8',
              border: `1px solid ${linked ? 'rgba(34,197,94,0.3)' : 'rgba(148,163,184,0.2)'}`,
            }}
          >
            {linked ? 'Подключено' : 'Не подключено'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {canConnect && !linked && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleConnect()}
              style={{
                padding: '7px 11px',
                borderRadius: 9,
                border: 'none',
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: busy ? 'wait' : 'pointer',
                opacity: busy ? 0.7 : 1,
              }}
            >
              {pendingCode || showCode ? 'Обновить код' : 'Подключить Telegram'}
            </button>
          )}
          {canUnlink && (linked || pendingCode) && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleUnlink()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 11px',
                borderRadius: 9,
                border: '1px solid rgba(248,113,113,0.3)',
                background: 'rgba(248,113,113,0.08)',
                color: '#fca5a5',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: busy ? 'wait' : 'pointer',
              }}
            >
              <Unplug size={12} />
              Отключить
            </button>
          )}
        </div>
      </div>

      {!canConnect && !linked && (
        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8', lineHeight: 1.45 }}>
          Уведомления о новых заявках получает менеджер площадки после привязки Telegram.
        </p>
      )}

      {canConnect && (pendingCode || (showCode && pendingCode)) && (
        <div style={{ marginTop: 10 }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, color: '#bae6fd', lineHeight: 1.5 }}>
            Откройте бота в Telegram и отправьте команду{' '}
            <code style={{ color: '#fff' }}>/start {pendingCode}</code>
            {link?.deepLink ? (
              <>
                {' '}или перейдите по{' '}
                <a href={link.deepLink} target="_blank" rel="noreferrer" style={{ color: '#7dd3fc' }}>
                  ссылке
                </a>
              </>
            ) : null}
            . Код действует ~30 минут.
          </p>
          <button
            type="button"
            onClick={() => void copyCode()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)',
              color: '#e2e8f0',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={12} color="#86efac" /> : <Copy size={12} />}
            {copied ? 'Скопировано' : 'Скопировать код'}
          </button>
        </div>
      )}

      {error && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#f87171' }}>{error}</p>
      )}
    </div>
  )
}
