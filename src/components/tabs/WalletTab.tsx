import { fadeUpContainer, fadeUpItem } from "../../utils/variants";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Send,
  Plus,
  RefreshCw,
} from "lucide-react";

const TRANSACTIONS = [
  {
    id: 1,
    name: "Оплата подписки",
    type: "out",
    amount: -2990,
    date: "11 мар 2026",
    icon: "💳",
    color: "#f472b6",
  },
  {
    id: 2,
    name: "Входящий платёж",
    type: "in",
    amount: +15000,
    date: "10 мар 2026",
    icon: "💰",
    color: "#34d399",
  },
  {
    id: 3,
    name: "Перевод команде",
    type: "out",
    amount: -5500,
    date: "9 мар 2026",
    icon: "👥",
    color: "#f472b6",
  },
  {
    id: 4,
    name: "Бонус за реферал",
    type: "in",
    amount: +1200,
    date: "8 мар 2026",
    icon: "🎁",
    color: "#34d399",
  },
  {
    id: 5,
    name: "Сервисы",
    type: "out",
    amount: -890,
    date: "7 мар 2026",
    icon: "⚙️",
    color: "#f472b6",
  },
];

export function WalletTab() {
  return (
    <motion.div
      className="p-4 pb-24 md:p-6 md:pb-6 space-y-4"
      variants={fadeUpContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUpItem}>
        <h1 className="text-2xl font-bold text-white">Кошелёк</h1>
        <p className="text-slate-400 text-sm mt-1">Ваш финансовый центр</p>
      </motion.div>

      {/* Balance card */}
      <motion.div
        variants={fadeUpItem}
        className="relative rounded-3xl p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
        }}
      >
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-32 translate-x-32"
          style={{ background: "rgba(255,255,255,0.08)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-24 -translate-x-16"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm mb-1">Общий баланс</p>
              <motion.p
                className="text-4xl font-black text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
              >
                ₽ 84,320
              </motion.p>
            </div>
            <div
              className="p-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <CreditCard size={24} className="text-white" />
            </div>
          </div>

          <div className="flex items-center gap-1 mb-1">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="text-white/80 font-mono text-lg tracking-widest"
              >
                {i < 3 ? "•••• " : "4821"}
              </span>
            ))}
          </div>
          <p className="text-white/60 text-sm">Nexus Virtual Card</p>
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={fadeUpItem} className="grid grid-cols-4 gap-3">
        {[
          { label: "Пополнить", icon: Plus, color: "#34d399" },
          { label: "Отправить", icon: Send, color: "#a855f7" },
          { label: "Вывести", icon: ArrowUpRight, color: "#22d3ee" },
          { label: "Обменять", icon: RefreshCw, color: "#fbbf24" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl glass"
              style={{ border: `1px solid ${action.color}25` }}
              whileHover={{ scale: 1.05, borderColor: `${action.color}50` }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${action.color}20` }}
              >
                <Icon size={18} style={{ color: action.color }} />
              </div>
              <span className="text-xs text-slate-400">{action.label}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Transactions */}
      <motion.div
        variants={fadeUpItem}
        className="glass rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h3 className="text-white font-semibold">История операций</h3>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {TRANSACTIONS.map((tx, i) => (
            <motion.div
              key={tx.id}
              className="flex items-center gap-4 px-5 py-3.5 glass-hover"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${tx.color}15` }}
              >
                {tx.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{tx.name}</p>
                <p className="text-slate-500 text-xs">{tx.date}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {tx.type === "in" ? (
                  <ArrowDownLeft size={14} className="text-green-400" />
                ) : (
                  <ArrowUpRight size={14} className="text-red-400" />
                )}
                <span
                  className="font-semibold text-sm"
                  style={{ color: tx.type === "in" ? "#34d399" : "#f87171" }}
                >
                  {tx.type === "in" ? "+" : ""}
                  {tx.amount.toLocaleString("ru")} ₽
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
