import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const result = await login(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error ?? 'Ошибка входа')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 50%, #0a0a1a 100%)',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Лого */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(124,58,237,0.5)',
              fontSize: '32px',
              marginBottom: '16px',
              boxShadow: '0 0 20px rgba(124,58,237,0.4)',
            }}
          >
            ⚡
          </div>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 900,
              margin: 0,
              background: 'linear-gradient(135deg, #a855f7, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NEXUS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px', letterSpacing: '3px' }}>
            PLATFORM
          </p>
        </div>

        {/* Карточка */}
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 40px rgba(124,58,237,0.15)',
          }}
        >
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>
            Добро пожаловать
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px 0' }}>
            Войдите в свой аккаунт
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#94a3b8',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  marginBottom: '6px',
                }}
              >
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  color: '#94a3b8',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  marginBottom: '6px',
                }}
              >
                ПАРОЛЬ
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px',
                    lineHeight: 1,
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                  fontSize: '13px',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                border: 'none',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isLoading ? 'wait' : 'pointer',
                boxShadow: '0 0 20px rgba(124,58,237,0.3)',
              }}
            >
              {isLoading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setEmail('demo@nexus.app'); setPassword('demo123') }}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '12px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Использовать demo аккаунт
          </button>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '20px' }}>
            Нет аккаунта?{' '}
            <Link
              to="/register"
              style={{ color: '#a855f7', fontWeight: 500, textDecoration: 'none' }}
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: '#374151', fontSize: '11px', marginTop: '20px' }}>
          © 2026 Nexus Platform
        </p>
      </div>
    </div>
  )
}
