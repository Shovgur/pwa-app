import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Search, Smile } from 'lucide-react'

const CHATS = [
  { id: 1, avatar: 'МС', name: 'Мария Смирнова', last: 'Отлично, жду результатов!', time: '2 мин', unread: 2, color: '#22d3ee', online: true },
  { id: 2, avatar: 'ДК', name: 'Дмитрий Козлов', last: 'Можем обсудить завтра?', time: '15 мин', unread: 1, color: '#f472b6', online: true },
  { id: 3, avatar: 'ЕВ', name: 'Елена Волкова', last: 'Документы готовы ✓', time: '1 ч', unread: 0, color: '#34d399', online: false },
  { id: 4, avatar: 'ИН', name: 'Иван Новиков', last: 'Спасибо за помощь!', time: '3 ч', unread: 0, color: '#fbbf24', online: false },
]

const MESSAGES: Record<number, Array<{ id: number; text: string; mine: boolean; time: string }>> = {
  1: [
    { id: 1, text: 'Привет! Как продвигается проект?', mine: false, time: '10:30' },
    { id: 2, text: 'Всё идёт по плану, уже на финальном этапе', mine: true, time: '10:32' },
    { id: 3, text: 'Когда можно ожидать первый релиз?', mine: false, time: '10:33' },
    { id: 4, text: 'Планируем на следующей неделе, готовим тестирование', mine: true, time: '10:35' },
    { id: 5, text: 'Отлично, жду результатов!', mine: false, time: '10:36' },
  ],
  2: [
    { id: 1, text: 'Дмитрий, нужно обсудить бюджет', mine: true, time: '14:00' },
    { id: 2, text: 'Можем обсудить завтра?', mine: false, time: '14:05' },
  ],
  3: [
    { id: 1, text: 'Елена, пришли пожалуйста отчёт', mine: true, time: '09:00' },
    { id: 2, text: 'Документы готовы ✓', mine: false, time: '09:30' },
  ],
  4: [
    { id: 1, text: 'Помог разобраться с задачей', mine: true, time: '16:00' },
    { id: 2, text: 'Спасибо за помощь!', mine: false, time: '16:10' },
  ],
}

export function MessagesTab() {
  const [activeChat, setActiveChat] = useState(1)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(MESSAGES)

  const chat = CHATS.find((c) => c.id === activeChat)!
  const chatMessages = messages[activeChat] ?? []

  function sendMessage() {
    if (!input.trim()) return
    const newMsg = { id: Date.now(), text: input, mine: true, time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) }
    setMessages((prev) => ({ ...prev, [activeChat]: [...(prev[activeChat] ?? []), newMsg] }))
    setInput('')
  }

  return (
    <motion.div
      className="flex h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Sidebar */}
      <div className="w-72 flex flex-col glass" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div className="p-4">
          <h2 className="text-white font-semibold mb-3">Сообщения</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Поиск..."
              className="w-full pl-8 pr-3 py-2 rounded-xl glass text-white placeholder-slate-500 outline-none text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {CHATS.map((c) => (
            <motion.div
              key={c.id}
              onClick={() => setActiveChat(c.id)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
              style={{
                background: activeChat === c.id ? `${c.color}12` : 'transparent',
                borderLeft: activeChat === c.id ? `2px solid ${c.color}` : '2px solid transparent',
              }}
              whileHover={{ x: 2 }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: `${c.color}25`, color: c.color }}
                >
                  {c.avatar}
                </div>
                {c.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                    style={{ background: '#34d399', borderColor: '#0a0a1a' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-medium truncate">{c.name}</span>
                  <span className="text-slate-600 text-xs ml-2 flex-shrink-0">{c.time}</span>
                </div>
                <p className="text-slate-500 text-xs truncate mt-0.5">{c.last}</p>
              </div>
              {c.unread > 0 && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: c.color, fontSize: 10 }}>
                  {c.unread}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-5 py-4 glass" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ background: `${chat.color}25`, color: chat.color }}
              >
                {chat.avatar}
              </div>
              {chat.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: '#34d399', borderColor: '#0a0a1a' }} />
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{chat.name}</p>
              <p className="text-xs" style={{ color: chat.online ? '#34d399' : '#475569' }}>
                {chat.online ? 'В сети' : 'Не в сети'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <AnimatePresence initial={false}>
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 150 }}
              >
                <div
                  className="max-w-xs px-4 py-2.5 rounded-2xl"
                  style={{
                    background: msg.mine
                      ? 'linear-gradient(135deg, #7c3aed, #06b6d4)'
                      : 'rgba(255,255,255,0.06)',
                    border: msg.mine ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: msg.mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  }}
                >
                  <p className="text-white text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 text-right" style={{ color: msg.mine ? 'rgba(255,255,255,0.6)' : '#475569' }}>
                    {msg.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="p-4 glass" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <motion.button className="text-slate-500 hover:text-yellow-400 transition-colors" whileTap={{ scale: 0.9 }}>
              <Smile size={20} />
            </motion.button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Написать сообщение..."
              className="flex-1 px-4 py-2.5 rounded-xl glass text-white placeholder-slate-500 outline-none text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <motion.button
              onClick={sendMessage}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: input.trim() ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : 'rgba(255,255,255,0.06)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
            >
              <Send size={16} className="text-white" style={{ transform: 'rotate(45deg)' }} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
