import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { colors } from '../theme/tokens'
import { useAuth } from '../contexts/AuthContext'
import { getAuthToken } from '../config/auth'
import { fetchYookassaPaymentStatus, type YookassaPaymentStatus } from '../lib/yookassaPayments'
import { isAuthExpiredError } from '../lib/authErrors'

type UiState = 'loading' | 'succeeded' | 'pending' | 'canceled' | 'error' | 'need_login'

export function PaymentResultPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const bookingIdParam = params.get('bookingId')
  const paymentIdParam = params.get('paymentId')
  const bookingId = bookingIdParam ? parseInt(bookingIdParam, 10) : undefined
  const returnPath = `/booking/payment-result?${params.toString()}`

  const [status, setStatus] = useState<YookassaPaymentStatus | null>(null)
  const [ui, setUi] = useState<UiState>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    // Cookie → localStorage restore happens in getAuthToken(); re-check after paint
    const hasToken = Boolean(getAuthToken())
    if (!isAuthenticated && !hasToken) {
      setUi('need_login')
      return
    }

    let cancelled = false
    let attempts = 0

    async function poll() {
      try {
        const data = await fetchYookassaPaymentStatus({
          bookingId: Number.isFinite(bookingId) ? bookingId : undefined,
          paymentId: paymentIdParam || undefined,
        })
        if (cancelled) return
        setStatus(data)
        if (data.paymentStatus === 'succeeded') {
          setUi('succeeded')
          return
        }
        if (data.paymentStatus === 'canceled') {
          setUi('canceled')
          return
        }
        setUi('pending')
        attempts += 1
        if (attempts < 6) {
          window.setTimeout(() => {
            if (!cancelled) void poll()
          }, 2000)
        }
      } catch (e) {
        if (cancelled) return
        if (isAuthExpiredError(e)) {
          setUi('need_login')
          return
        }
        setError(e instanceof Error ? e.message : 'Не удалось проверить оплату')
        setUi('error')
      }
    }

    if (!Number.isFinite(bookingId) && !paymentIdParam) {
      setError('Нет данных о платеже')
      setUi('error')
      return
    }

    void poll()
    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, bookingId, paymentIdParam, params])

  if (authLoading || ui === 'loading') {
    return (
      <div className="page-center" style={{ minHeight: '60vh' }}>
        <Loader2 size={40} color={colors.green} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: colors.muted, marginTop: 16 }}>Проверяем оплату…</p>
      </div>
    )
  }

  if (ui === 'need_login') {
    return (
      <div className="page-center" style={{ minHeight: '60vh', padding: 24 }}>
        <Clock size={64} color={colors.orange || '#f97316'} />
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '24px 0 8px' }}>Почти готово</h1>
        <p style={{ color: colors.muted, marginBottom: 32, maxWidth: 420, textAlign: 'center' }}>
          Оплата могла пройти успешно. Чтобы увидеть статус и брони, войдите в тот же аккаунт —
          браузер оплаты иногда не сохраняет сессию.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            onClick={() => navigate('/login', { replace: true, state: { from: returnPath } })}
          >
            Войти и проверить
          </Button>
          <Link to="/dashboard/bookings"><Button variant="ghost">Мои брони</Button></Link>
        </div>
      </div>
    )
  }

  if (ui === 'succeeded') {
    return (
      <div className="page-center" style={{ minHeight: '60vh', padding: 24 }}>
        <CheckCircle2 size={64} color={colors.green} />
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '24px 0 8px' }}>Оплата прошла</h1>
        <p style={{ color: colors.muted, marginBottom: 8 }}>
          {status?.venueName || 'Бронь'}
          {status?.code ? ` · код ${status.code}` : ''}
        </p>
        {status?.price != null && (
          <p style={{ color: colors.text, fontWeight: 700, marginBottom: 32 }}>
            {Number(status.price).toLocaleString('ru-RU')} ₽
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/dashboard/bookings"><Button>Мои брони</Button></Link>
          <Link to="/catalog"><Button variant="ghost">К каталогу</Button></Link>
        </div>
      </div>
    )
  }

  if (ui === 'canceled') {
    return (
      <div className="page-center" style={{ minHeight: '60vh', padding: 24 }}>
        <XCircle size={64} color="#f87171" />
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '24px 0 8px' }}>Оплата не завершена</h1>
        <p style={{ color: colors.muted, marginBottom: 32 }}>
          Бронь сохранена, но ещё не оплачена. Можно оплатить снова из личного кабинета.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/dashboard/bookings"><Button>Мои брони</Button></Link>
          <Link to="/catalog"><Button variant="ghost">К каталогу</Button></Link>
        </div>
      </div>
    )
  }

  if (ui === 'error') {
    return (
      <div className="page-center" style={{ minHeight: '60vh', padding: 24 }}>
        <XCircle size={64} color="#f87171" />
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '24px 0 8px' }}>Не удалось проверить</h1>
        <p style={{ color: colors.muted, marginBottom: 32 }}>{error}</p>
        <Link to="/dashboard/bookings"><Button>Мои брони</Button></Link>
      </div>
    )
  }

  return (
    <div className="page-center" style={{ minHeight: '60vh', padding: 24 }}>
      <Clock size={64} color={colors.orange || '#f97316'} />
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '24px 0 8px' }}>Ожидаем подтверждение</h1>
      <p style={{ color: colors.muted, marginBottom: 32, maxWidth: 420, textAlign: 'center' }}>
        Платёж обрабатывается. Статус обновится автоматически — проверьте брони в личном кабинете через минуту.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/dashboard/bookings"><Button>Мои брони</Button></Link>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            color: colors.text2,
            padding: '12px 18px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 600,
          }}
        >
          Обновить статус
        </button>
      </div>
    </div>
  )
}
