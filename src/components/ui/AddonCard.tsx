import { motion } from 'framer-motion'
import { ChevronDown, Utensils, Wine, Projector, Music, Camera, Sparkles } from 'lucide-react'
import type { AddOn } from '../../data/venues'
import { getAddonOption } from '../../data/venues'
import { colors } from '../../theme/tokens'

const ICONS = {
  utensils: Utensils,
  wine: Wine,
  projector: Projector,
  music: Music,
  camera: Camera,
  sparkles: Sparkles,
}

interface AddonCardProps {
  addon: AddOn
  active: boolean
  selectedOptionId?: string
  onToggle: () => void
  onSelectOption: (optionId: string) => void
  index?: number
}

export function AddonCard({
  addon,
  active,
  selectedOptionId,
  onToggle,
  onSelectOption,
  index = 0,
}: AddonCardProps) {
  const Icon = ICONS[addon.icon]
  const isSelect = addon.mode === 'select' && addon.options && addon.options.length > 0
  const selectedOption = selectedOptionId ? getAddonOption(addon, selectedOptionId) : undefined
  const showOptions = active && isSelect

  return (
    <motion.div
      className={`addon-card ${active ? 'addon-card--active' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="addon-card-head">
        <div className="addon-card-info">
          <div className="addon-card-icon">
            <Icon size={20} color={colors.orange} />
          </div>
          <div>
            <p className="addon-card-title">{addon.name}</p>
            <p className="addon-card-desc">
              {active && selectedOption ? selectedOption.name : addon.description}
            </p>
          </div>
        </div>

        <div className="addon-card-actions">
          <span className="addon-card-price">
            + {(selectedOption?.price ?? addon.price).toLocaleString()} ₽
          </span>
          <button
            type="button"
            className={`addon-toggle ${active ? 'addon-toggle--on' : ''}`}
            onClick={onToggle}
            aria-pressed={active}
            aria-label={active ? `Убрать ${addon.name}` : `Добавить ${addon.name}`}
          >
            <span className="addon-toggle-knob" />
          </button>
        </div>
      </div>

      {isSelect && (
        <div className={`addon-options-wrap ${showOptions ? 'addon-options-wrap--open' : ''}`}>
          <div className="addon-options">
            <div className="addon-options-inner">
              <p className="addon-options-label">
                <ChevronDown size={14} className={showOptions ? 'addon-options-chevron--open' : ''} />
                Выберите вариант
              </p>
              <div className="addon-options-grid">
                {addon.options!.map((option) => {
                  const picked = selectedOptionId === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`addon-option ${picked ? 'addon-option--picked' : ''}`}
                      onClick={() => onSelectOption(option.id)}
                    >
                      <div
                        className="addon-option-image"
                        style={{ background: option.image }}
                      />
                      <div className="addon-option-body">
                        <span className="addon-option-name">{option.name}</span>
                        <span className="addon-option-desc">{option.description}</span>
                        {(option.price ?? addon.price) !== addon.price && (
                          <span className="addon-option-price">
                            {(option.price ?? addon.price).toLocaleString()} ₽
                          </span>
                        )}
                      </div>
                      {picked && <span className="addon-option-check">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
