import { describe, expect, it } from 'vitest'
import { moderateText, statusFromModeration } from './reviewModeration.js'

describe('moderateText', () => {
  it('пустой текст — publish', () => {
    expect(moderateText('')).toEqual({ verdict: 'publish', flags: [] })
    expect(moderateText(null)).toEqual({ verdict: 'publish', flags: [] })
  })

  it('чистый текст — publish', () => {
    expect(moderateText('Отличный корт, всё чисто и удобно.')).toEqual({
      verdict: 'publish',
      flags: [],
    })
  })

  it('телефон / ссылка — hold', () => {
    const phone = moderateText('Пишите на +7 999 123-45-67')
    expect(phone.verdict).toBe('hold')
    expect(phone.flags).toContain('phone')

    const url = moderateText('Смотрите https://spam.example.com')
    expect(url.verdict).toBe('hold')
    expect(url.flags).toContain('contact')
  })

  it('мат — hold/reject', () => {
    const one = moderateText('Просто сука сервис')
    expect(['hold', 'reject']).toContain(one.verdict)
    expect(one.flags).toContain('profanity')
  })
})

describe('statusFromModeration', () => {
  it('маппит verdict → status', () => {
    expect(statusFromModeration('publish')).toBe('published')
    expect(statusFromModeration('hold')).toBe('pending')
    expect(statusFromModeration('reject')).toBe('rejected')
  })
})
