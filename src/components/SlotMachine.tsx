import { useEffect, useRef, useState } from 'react'
import chaos from '../chaos.json'
import questions from '../questions.json'
import ModeToggle, { type SlotMode } from './ModeToggle'
import Reel from './Reel'
import SpinButton from './SpinButton'
import ThemeControls from './ThemeControls'
import type { PaletteId } from '../theme'

interface SlotMachineProps {
  selectedPalette: PaletteId
  isDarkMode: boolean
  onPaletteCycle: () => void
  onDarkToggle: () => void
}

const SAFE_MIN_STEPS = 24
const SAFE_EXTRA_STEPS = 20
const SAFE_MIN_DELAY = 45
const SAFE_MAX_DELAY = 280

type ChaosReelKey = 'opener' | 'descriptor' | 'topic'
const CHAOS_REEL_KEYS: ChaosReelKey[] = ['opener', 'descriptor', 'topic']

const CHAOS_MIN_STEPS: Record<ChaosReelKey, number> = {
  opener: 24,
  descriptor: 40,
  topic: 56,
}
const CHAOS_EXTRA_STEPS = 6
const CHAOS_MIN_DELAY = 45
const CHAOS_MAX_DELAY = 280

function SlotMachine({
  selectedPalette,
  isDarkMode,
  onPaletteCycle,
  onDarkToggle,
}: SlotMachineProps) {
  const [mode, setMode] = useState<SlotMode>('safe')
  const [safeIndex, setSafeIndex] = useState<number>(() =>
    Math.floor(Math.random() * questions.length),
  )
  const [openerIndex, setOpenerIndex] = useState<number>(() =>
    Math.floor(Math.random() * chaos.openers.length),
  )
  const [descriptorIndex, setDescriptorIndex] = useState<number>(() =>
    Math.floor(Math.random() * chaos.descriptors.length),
  )
  const [topicIndex, setTopicIndex] = useState<number>(() =>
    Math.floor(Math.random() * chaos.topics.length),
  )
  const [isSpinning, setIsSpinning] = useState(false)
  const [isOpenerSpinning, setIsOpenerSpinning] = useState(false)
  const [isDescriptorSpinning, setIsDescriptorSpinning] = useState(false)
  const [isTopicSpinning, setIsTopicSpinning] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [displayText, setDisplayText] = useState(questions[safeIndex])

  const safeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chaosTimeoutRefs = useRef<
    Record<ChaosReelKey, ReturnType<typeof setTimeout> | null>
  >({
    opener: null,
    descriptor: null,
    topic: null,
  })
  const spinSessionRef = useRef(0)

  const chaosPreview = {
    opener: chaos.openers[openerIndex],
    descriptor: chaos.descriptors[descriptorIndex],
    topic: chaos.topics[topicIndex],
  }

  const chaosPreviewText = `${chaosPreview.opener} ${chaosPreview.descriptor} ${chaosPreview.topic}?`

  const clearAllSpinTimeouts = () => {
    if (safeTimeoutRef.current) {
      clearTimeout(safeTimeoutRef.current)
      safeTimeoutRef.current = null
    }

    CHAOS_REEL_KEYS.forEach((reelKey) => {
      const reelTimeout = chaosTimeoutRefs.current[reelKey]
      if (!reelTimeout) {
        return
      }

      clearTimeout(reelTimeout)
      chaosTimeoutRefs.current[reelKey] = null
    })
  }

  const beginSpinSession = () => {
    spinSessionRef.current += 1
    clearAllSpinTimeouts()
    return spinSessionRef.current
  }

  useEffect(() => {
    return () => {
      beginSpinSession()
    }
  }, [])

  useEffect(() => {
    if (mode === 'safe') {
      setDisplayText(questions[safeIndex])
      return
    }

    if (!isSpinning) {
      setDisplayText(chaosPreviewText)
    }
  }, [mode, safeIndex, chaosPreviewText, isSpinning])

  const startSafeSpin = () => {
    if (isSpinning) {
      return
    }

    const spinSessionId = beginSpinSession()
    setIsSpinning(true)
    const totalItems = questions.length
    const finalIndex = Math.floor(Math.random() * totalItems)
    const loopOffset = (finalIndex - safeIndex + totalItems) % totalItems
    const totalSteps =
      SAFE_MIN_STEPS + Math.floor(Math.random() * SAFE_EXTRA_STEPS) + loopOffset

    let step = 0
    let cursor = safeIndex

    const spinStep = () => {
      if (spinSessionRef.current !== spinSessionId) {
        return
      }

      step += 1
      cursor = (cursor + 1) % totalItems
      setSafeIndex(cursor)
      setDisplayText(questions[cursor])

      if (step < totalSteps) {
        const progress = step / totalSteps
        const easedProgress = progress * progress
        const delay = Math.round(
          SAFE_MIN_DELAY + (SAFE_MAX_DELAY - SAFE_MIN_DELAY) * easedProgress,
        )
        safeTimeoutRef.current = setTimeout(spinStep, delay)
        return
      }

      setIsSpinning(false)
      safeTimeoutRef.current = null
    }

    spinStep()
  }

  const startChaosReelSpin = ({
    reelKey,
    startIndex,
    totalItems,
    minSteps,
    onStep,
    onComplete,
    spinSessionId,
  }: {
    reelKey: ChaosReelKey
    startIndex: number
    totalItems: number
    minSteps: number
    onStep: (index: number) => void
    onComplete: () => void
    spinSessionId: number
  }) => {
    const finalIndex = Math.floor(Math.random() * totalItems)
    const loopOffset = (finalIndex - startIndex + totalItems) % totalItems
    const totalSteps =
      minSteps + Math.floor(Math.random() * CHAOS_EXTRA_STEPS) + loopOffset

    let step = 0
    let cursor = startIndex

    const spinStep = () => {
      if (spinSessionRef.current !== spinSessionId) {
        return
      }

      step += 1
      cursor = (cursor + 1) % totalItems
      onStep(cursor)

      if (step < totalSteps) {
        const progress = step / totalSteps
        const easedProgress = progress * progress
        const delay = Math.round(
          CHAOS_MIN_DELAY + (CHAOS_MAX_DELAY - CHAOS_MIN_DELAY) * easedProgress,
        )
        chaosTimeoutRefs.current[reelKey] = setTimeout(spinStep, delay)
        return
      }

      chaosTimeoutRefs.current[reelKey] = null
      onComplete()
    }

    spinStep()
  }

  const startChaosSpin = () => {
    if (isSpinning) {
      return
    }

    const spinSessionId = beginSpinSession()
    setIsSpinning(true)
    setIsOpenerSpinning(true)
    setIsDescriptorSpinning(true)
    setIsTopicSpinning(true)

    let completedReels = 0

    const markComplete = (reelKey: ChaosReelKey) => {
      if (spinSessionRef.current !== spinSessionId) {
        return
      }

      if (reelKey === 'opener') {
        setIsOpenerSpinning(false)
      } else if (reelKey === 'descriptor') {
        setIsDescriptorSpinning(false)
      } else {
        setIsTopicSpinning(false)
      }

      completedReels += 1

      if (completedReels === 3) {
        setIsSpinning(false)
      }
    }

    startChaosReelSpin({
      reelKey: 'opener',
      startIndex: openerIndex,
      totalItems: chaos.openers.length,
      minSteps: CHAOS_MIN_STEPS.opener,
      onStep: setOpenerIndex,
      onComplete: () => markComplete('opener'),
      spinSessionId,
    })

    startChaosReelSpin({
      reelKey: 'descriptor',
      startIndex: descriptorIndex,
      totalItems: chaos.descriptors.length,
      minSteps: CHAOS_MIN_STEPS.descriptor,
      onStep: setDescriptorIndex,
      onComplete: () => markComplete('descriptor'),
      spinSessionId,
    })

    startChaosReelSpin({
      reelKey: 'topic',
      startIndex: topicIndex,
      totalItems: chaos.topics.length,
      minSteps: CHAOS_MIN_STEPS.topic,
      onStep: setTopicIndex,
      onComplete: () => markComplete('topic'),
      spinSessionId,
    })
  }

  const handleSpin = () => {
    if (mode === 'chaos') {
      startChaosSpin()
      return
    }

    startSafeSpin()
  }

  return (
    <section className="machine-panel">
      <div className="panel-top-row">
        <div className="panel-top-left">
          <ModeToggle mode={mode} onChange={setMode} disabled={isSpinning} />
          <div className="help-control">
            <button
              type="button"
              className="help-button"
              onClick={() => setShowHelp((current) => !current)}
              aria-expanded={showHelp}
              aria-controls="slot-help"
              aria-label="Show instructions"
            >
              ?
            </button>
            {showHelp ? (
              <p className="help-popover" id="slot-help">
                Spin to get a question. Ask it to a stranger.
              </p>
            ) : null}
          </div>
        </div>
        <div className="panel-top-right">
          <ThemeControls
            selectedPalette={selectedPalette}
            isDarkMode={isDarkMode}
            onPaletteCycle={onPaletteCycle}
            onDarkToggle={onDarkToggle}
          />
        </div>
      </div>

      {mode === 'safe' ? (
        <Reel
          items={questions}
          displayValue={questions[safeIndex]}
          isSpinning={isSpinning}
          label="Safe Reel"
        />
      ) : (
        <div className="chaos-reels">
          <Reel
            items={chaos.openers}
            displayValue={chaos.openers[openerIndex]}
            isSpinning={isOpenerSpinning}
            label="Opener"
          />
          <Reel
            items={chaos.descriptors}
            displayValue={chaos.descriptors[descriptorIndex]}
            isSpinning={isDescriptorSpinning}
            label="Descriptor"
          />
          <Reel
            items={chaos.topics}
            displayValue={chaos.topics[topicIndex]}
            isSpinning={isTopicSpinning}
            label="Topic"
          />
        </div>
      )}

      <div className="question-display" role="status" aria-live="polite">
        {displayText}
      </div>

      <SpinButton onSpin={handleSpin} disabled={isSpinning} />
    </section>
  )
}

export default SlotMachine
