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
  onPaletteChange: (palette: PaletteId) => void
  onDarkToggle: () => void
}

const SAFE_MIN_STEPS = 24
const SAFE_EXTRA_STEPS = 20
const SAFE_MIN_DELAY = 45
const SAFE_MAX_DELAY = 280

function SlotMachine({
  selectedPalette,
  isDarkMode,
  onPaletteChange,
  onDarkToggle,
}: SlotMachineProps) {
  const [mode, setMode] = useState<SlotMode>('safe')
  const [safeIndex, setSafeIndex] = useState<number>(() =>
    Math.floor(Math.random() * questions.length),
  )
  const [isSpinning, setIsSpinning] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [displayText, setDisplayText] = useState(questions[safeIndex])

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const chaosPreview = {
    opener: chaos.openers[safeIndex % chaos.openers.length],
    descriptor: chaos.descriptors[safeIndex % chaos.descriptors.length],
    topic: chaos.topics[safeIndex % chaos.topics.length],
  }

  const chaosPreviewText = `${chaosPreview.opener} ${chaosPreview.descriptor} ${chaosPreview.topic}?`

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (mode === 'safe') {
      setDisplayText(questions[safeIndex])
      return
    }

    setDisplayText(chaosPreviewText)
  }, [mode, safeIndex, chaosPreviewText])

  const startSafeSpin = () => {
    if (isSpinning) {
      return
    }

    setIsSpinning(true)
    const totalItems = questions.length
    const finalIndex = Math.floor(Math.random() * totalItems)
    const loopOffset = (finalIndex - safeIndex + totalItems) % totalItems
    const totalSteps =
      SAFE_MIN_STEPS + Math.floor(Math.random() * SAFE_EXTRA_STEPS) + loopOffset

    let step = 0
    let cursor = safeIndex

    const spinStep = () => {
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
        timeoutRef.current = setTimeout(spinStep, delay)
        return
      }

      setIsSpinning(false)
      timeoutRef.current = null
    }

    spinStep()
  }

  const handleSpin = () => {
    if (mode === 'chaos') {
      // TODO: Wire independent chaos reel spin timing + compose the final prompt.
      setDisplayText('CHAOS MODE TODO: wire opener + descriptor + topic reel logic.')
      return
    }

    startSafeSpin()
  }

  return (
    <section className="machine-panel">
      <div className="panel-top-row">
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
      <ThemeControls
        selectedPalette={selectedPalette}
        isDarkMode={isDarkMode}
        onPaletteChange={onPaletteChange}
        onDarkToggle={onDarkToggle}
      />

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
            displayValue={chaosPreview.opener}
            isSpinning={false}
            label="Opener"
          />
          <Reel
            items={chaos.descriptors}
            displayValue={chaosPreview.descriptor}
            isSpinning={false}
            label="Descriptor"
          />
          <Reel
            items={chaos.topics}
            displayValue={chaosPreview.topic}
            isSpinning={false}
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
