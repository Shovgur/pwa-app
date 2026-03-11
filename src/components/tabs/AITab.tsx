import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Bot, User, Zap } from 'lucide-react'

const SUGGESTIONS = [
  'Как улучшить производительность команды?',
  'Проанализируй тренды рынка',
  'Составь план проекта на месяц',
  'Как оптимизировать расходы?',
]

const RESPONSES: Record<string, string> = {
  default: 'Это отличный вопрос! Я анализирую данные вашей платформы и могу предложить следующее решение. Основываясь на текущих показателях, рекомендую сфокусироваться на ключевых метриках роста и оптимизации процессов.',
}

interface Message {
  id: number
  text: string
  mine: boolean
  typing?: boolean
}

export function AITab() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: 'Привет! Я ваш AI-ассистент Nexus. Задайте любой вопрос о вашей платформе, аналитике или бизнесе, и я помогу найти ответ. ✨', mine: false },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const msg = text ?? input
    if (!msg.trim() || isTyping) return
    setInput('')

    const userMsg: Message = { id: Date.now(), text: msg, mine: true }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000))

    const reply = RESPONSES.default
    setIsTyping(false)
    setMessages((prev) => [...prev, { id: Date.now(), text: reply, mine: false }])
  }

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="px-6 py-4 glass" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #818cf8)' }}
            animate={{
              boxShadow: ['0 0 10px rgba(124,58,237,0.4)', '0 0 25px rgba(124,58,237,0.7)', '0 0 10px rgba(124,58,237,0.4)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={18} className="text-white" />
          </motion.div>
          <div>
            <h2 className="text-white font-semibold">Nexus AI</h2>
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-green-400 text-xs">Активен</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl glass"
            style={{ border: '1px solid rgba(168,85,247,0.3)' }}>
            <Zap size={12} className="text-purple-400" />
            <span className="text-purple-400 text-xs">GPT-4 Nexus</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex gap-3 ${msg.mine ? 'flex-row-reverse' : ''}`}
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120 }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: msg.mine
                    ? 'linear-gradient(135deg, #7c3aed, #ec4899)'
                    : 'linear-gradient(135deg, #818cf8, #7c3aed)',
                }}
              >
                {msg.mine ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
              </div>
              <div
                className="max-w-lg px-4 py-3 rounded-2xl"
                style={{
                  background: msg.mine
                    ? 'linear-gradient(135deg, #7c3aed30, #06b6d430)'
                    : 'rgba(255,255,255,0.05)',
                  border: msg.mine
                    ? '1px solid rgba(124,58,237,0.3)'
                    : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <p className="text-white text-sm leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #818cf8, #7c3aed)' }}>
              <Bot size={14} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl glass" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-1.5">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-400"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      <div className="px-6 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              onClick={() => sendMessage(s)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs text-purple-300 glass"
              style={{ border: '1px solid rgba(168,85,247,0.25)' }}
              whileHover={{ scale: 1.03, borderColor: 'rgba(168,85,247,0.5)' }}
              whileTap={{ scale: 0.97 }}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 pb-6">
        <div
          className="flex items-center gap-3 p-2 pl-4 rounded-2xl glass"
          style={{ border: '1px solid rgba(168,85,247,0.2)' }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Спросите Nexus AI..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
          />
          <motion.button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: input.trim() && !isTyping
                ? 'linear-gradient(135deg, #7c3aed, #06b6d4)'
                : 'rgba(255,255,255,0.06)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <Send size={15} className="text-white" style={{ transform: 'rotate(45deg)' }} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
