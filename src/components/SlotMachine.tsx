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

type ChaosReelKey = 'opener' | 'descriptor' | 'topic'
type ReelKey = 'safe' | ChaosReelKey

const CHAOS_REEL_KEYS: ChaosReelKey[] = ['opener', 'descriptor', 'topic']
const ALL_REEL_KEYS: ReelKey[] = ['safe', ...CHAOS_REEL_KEYS]

const SAFE_SPIN_DURATION_MS = 2200
const SAFE_SPIN_DURATION_JITTER_MS = 280
const SAFE_DISTANCE_MIN = 34
const SAFE_DISTANCE_MAX = 54

const CHAOS_SPIN_DURATION_MS = 1980
const CHAOS_SPIN_DURATION_JITTER_MS = 220
const CHAOS_STOP_STAGGER_MS: Record<ChaosReelKey, number> = {
  opener: 0,
  descriptor: 180,
  topic: 360,
}
const CHAOS_DISTANCE_RANGES: Record<ChaosReelKey, { min: number; max: number }> = {
  opener: { min: 36, max: 54 },
  descriptor: { min: 44, max: 62 },
  topic: { min: 52, max: 72 },
}

const REDUCED_SPIN_DURATION_MS = 300
const REDUCED_CHAOS_STAGGER_MS: Record<ChaosReelKey, number> = {
  opener: 0,
  descriptor: 50,
  topic: 100,
}
const REDUCED_SAFE_DISTANCE_MIN = 8
const REDUCED_SAFE_DISTANCE_MAX = 14
const REDUCED_CHAOS_DISTANCE_RANGES: Record<ChaosReelKey, { min: number; max: number }> = {
  opener: { min: 8, max: 12 },
  descriptor: { min: 9, max: 13 },
  topic: { min: 10, max: 14 },
}

const PROFILE_ACCEL_PORTION = 0.2
const PROFILE_CRUISE_PORTION = 0.45
const PROFILE_DECEL_PORTION = 0.35

const PROFILE_PEAK_SPEED =
  1 /
  (0.5 * PROFILE_ACCEL_PORTION +
    PROFILE_CRUISE_PORTION +
    0.5 * PROFILE_DECEL_PORTION)

const PROFILE_ACCEL_DISTANCE =
  0.5 * PROFILE_PEAK_SPEED * PROFILE_ACCEL_PORTION
const PROFILE_CRUISE_DISTANCE = PROFILE_PEAK_SPEED * PROFILE_CRUISE_PORTION
const PROFILE_DECEL_DISTANCE =
  0.5 * PROFILE_PEAK_SPEED * PROFILE_DECEL_PORTION

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const modulo = (value: number, divisor: number) => {
  const remainder = value % divisor
  return remainder < 0 ? remainder + divisor : remainder
}

const randomInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1))

const getSpinProgress = (progress: number) => {
  const normalized = clamp(progress, 0, 1)

  if (normalized <= PROFILE_ACCEL_PORTION) {
    const phaseProgress = normalized / PROFILE_ACCEL_PORTION
    return PROFILE_ACCEL_DISTANCE * phaseProgress * phaseProgress
  }

  if (normalized <= PROFILE_ACCEL_PORTION + PROFILE_CRUISE_PORTION) {
    const phaseProgress =
      (normalized - PROFILE_ACCEL_PORTION) / PROFILE_CRUISE_PORTION
    return PROFILE_ACCEL_DISTANCE + PROFILE_CRUISE_DISTANCE * phaseProgress
  }

  const phaseProgress =
    (normalized - PROFILE_ACCEL_PORTION - PROFILE_CRUISE_PORTION) /
    PROFILE_DECEL_PORTION

  return (
    PROFILE_ACCEL_DISTANCE +
    PROFILE_CRUISE_DISTANCE +
    PROFILE_DECEL_DISTANCE * (1 - (1 - phaseProgress) * (1 - phaseProgress))
  )
}

const getSpinVelocityFactor = (progress: number) => {
  const normalized = clamp(progress, 0, 1)

  if (normalized <= PROFILE_ACCEL_PORTION) {
    const phaseProgress = normalized / PROFILE_ACCEL_PORTION
    return (2 * PROFILE_ACCEL_DISTANCE * phaseProgress) / PROFILE_ACCEL_PORTION
  }

  if (normalized <= PROFILE_ACCEL_PORTION + PROFILE_CRUISE_PORTION) {
    return PROFILE_CRUISE_DISTANCE / PROFILE_CRUISE_PORTION
  }

  const phaseProgress =
    (normalized - PROFILE_ACCEL_PORTION - PROFILE_CRUISE_PORTION) /
    PROFILE_DECEL_PORTION

  return (
    (2 * PROFILE_DECEL_DISTANCE * (1 - phaseProgress)) / PROFILE_DECEL_PORTION
  )
}

function SlotMachine({
  selectedPalette,
  isDarkMode,
  onPaletteCycle,
  onDarkToggle,
}: SlotMachineProps) {
  const initialSafeIndexRef = useRef(Math.floor(Math.random() * questions.length))
  const initialOpenerIndexRef = useRef(Math.floor(Math.random() * chaos.openers.length))
  const initialDescriptorIndexRef = useRef(
    Math.floor(Math.random() * chaos.descriptors.length),
  )
  const initialTopicIndexRef = useRef(Math.floor(Math.random() * chaos.topics.length))

  const [mode, setMode] = useState<SlotMode>('safe')
  const [safeIndex, setSafeIndex] = useState<number>(initialSafeIndexRef.current)
  const [openerIndex, setOpenerIndex] = useState<number>(initialOpenerIndexRef.current)
  const [descriptorIndex, setDescriptorIndex] = useState<number>(
    initialDescriptorIndexRef.current,
  )
  const [topicIndex, setTopicIndex] = useState<number>(initialTopicIndexRef.current)

  const [safeReelPosition, setSafeReelPosition] = useState<number>(
    initialSafeIndexRef.current,
  )
  const [openerReelPosition, setOpenerReelPosition] = useState<number>(
    initialOpenerIndexRef.current,
  )
  const [descriptorReelPosition, setDescriptorReelPosition] = useState<number>(
    initialDescriptorIndexRef.current,
  )
  const [topicReelPosition, setTopicReelPosition] = useState<number>(
    initialTopicIndexRef.current,
  )

  const [safeSpinVelocity, setSafeSpinVelocity] = useState(0)
  const [openerSpinVelocity, setOpenerSpinVelocity] = useState(0)
  const [descriptorSpinVelocity, setDescriptorSpinVelocity] = useState(0)
  const [topicSpinVelocity, setTopicSpinVelocity] = useState(0)

  const [isSpinning, setIsSpinning] = useState(false)
  const [isOpenerSpinning, setIsOpenerSpinning] = useState(false)
  const [isDescriptorSpinning, setIsDescriptorSpinning] = useState(false)
  const [isTopicSpinning, setIsTopicSpinning] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [displayText, setDisplayText] = useState(questions[initialSafeIndexRef.current])
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  const reelAnimationRefs = useRef<Record<ReelKey, number | null>>({
    safe: null,
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

  const clearAllSpinAnimations = () => {
    ALL_REEL_KEYS.forEach((reelKey) => {
      const frameId = reelAnimationRefs.current[reelKey]
      if (frameId === null) {
        return
      }

      cancelAnimationFrame(frameId)
      reelAnimationRefs.current[reelKey] = null
    })
  }

  const beginSpinSession = () => {
    spinSessionRef.current += 1
    clearAllSpinAnimations()
    return spinSessionRef.current
  }

  useEffect(() => {
    return () => {
      beginSpinSession()
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    setPrefersReducedMotion(mediaQueryList.matches)
    mediaQueryList.addEventListener('change', handleChange)

    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
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

  const startReelAnimation = ({
    reelKey,
    startIndex,
    totalItems,
    distance,
    durationMs,
    spinSessionId,
    onFrame,
    onComplete,
  }: {
    reelKey: ReelKey
    startIndex: number
    totalItems: number
    distance: number
    durationMs: number
    spinSessionId: number
    onFrame: (position: number, velocityItemsPerSecond: number) => void
    onComplete: (finalIndex: number) => void
  }) => {
    const safeDurationMs = Math.max(durationMs, 1)
    const animationStart = performance.now()

    const animate = (now: number) => {
      if (spinSessionRef.current !== spinSessionId) {
        reelAnimationRefs.current[reelKey] = null
        return
      }

      const elapsedMs = now - animationStart
      const progress = clamp(elapsedMs / safeDurationMs, 0, 1)
      const distanceProgress = getSpinProgress(progress)
      const position = startIndex + distance * distanceProgress
      const velocityItemsPerSecond =
        ((distance / safeDurationMs) * getSpinVelocityFactor(progress)) * 1000

      onFrame(position, velocityItemsPerSecond)

      if (progress < 1) {
        reelAnimationRefs.current[reelKey] = requestAnimationFrame(animate)
        return
      }

      const finalPosition = startIndex + distance
      const finalIndex = modulo(finalPosition, totalItems)
      onFrame(finalPosition, 0)
      onComplete(finalIndex)
      reelAnimationRefs.current[reelKey] = null
    }

    reelAnimationRefs.current[reelKey] = requestAnimationFrame(animate)
  }

  const startSafeSpin = () => {
    if (isSpinning) {
      return
    }

    const spinSessionId = beginSpinSession()
    setIsSpinning(true)

    const distance = prefersReducedMotion
      ? randomInt(REDUCED_SAFE_DISTANCE_MIN, REDUCED_SAFE_DISTANCE_MAX)
      : randomInt(SAFE_DISTANCE_MIN, SAFE_DISTANCE_MAX)

    const durationMs = prefersReducedMotion
      ? REDUCED_SPIN_DURATION_MS
      : SAFE_SPIN_DURATION_MS +
        randomInt(-SAFE_SPIN_DURATION_JITTER_MS, SAFE_SPIN_DURATION_JITTER_MS)

    startReelAnimation({
      reelKey: 'safe',
      startIndex: safeIndex,
      totalItems: questions.length,
      distance,
      durationMs,
      spinSessionId,
      onFrame: (position, velocity) => {
        setSafeReelPosition(position)
        setSafeSpinVelocity(velocity)
      },
      onComplete: (finalIndex) => {
        if (spinSessionRef.current !== spinSessionId) {
          return
        }

        setSafeIndex(finalIndex)
        setSafeReelPosition(finalIndex)
        setSafeSpinVelocity(0)
        setIsSpinning(false)
      },
    })
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

      if (completedReels === CHAOS_REEL_KEYS.length) {
        setIsSpinning(false)
      }
    }

    const spinChaosReel = ({
      reelKey,
      startIndex,
      totalItems,
      onPosition,
      onVelocity,
      onIndex,
    }: {
      reelKey: ChaosReelKey
      startIndex: number
      totalItems: number
      onPosition: (position: number) => void
      onVelocity: (velocity: number) => void
      onIndex: (index: number) => void
    }) => {
      const range = prefersReducedMotion
        ? REDUCED_CHAOS_DISTANCE_RANGES[reelKey]
        : CHAOS_DISTANCE_RANGES[reelKey]

      const distance = randomInt(range.min, range.max)

      const durationMs = prefersReducedMotion
        ? REDUCED_SPIN_DURATION_MS + REDUCED_CHAOS_STAGGER_MS[reelKey]
        : CHAOS_SPIN_DURATION_MS +
          randomInt(-CHAOS_SPIN_DURATION_JITTER_MS, CHAOS_SPIN_DURATION_JITTER_MS) +
          CHAOS_STOP_STAGGER_MS[reelKey]

      startReelAnimation({
        reelKey,
        startIndex,
        totalItems,
        distance,
        durationMs,
        spinSessionId,
        onFrame: (position, velocity) => {
          onPosition(position)
          onVelocity(velocity)
        },
        onComplete: (finalIndex) => {
          if (spinSessionRef.current !== spinSessionId) {
            return
          }

          onIndex(finalIndex)
          onPosition(finalIndex)
          onVelocity(0)
          markComplete(reelKey)
        },
      })
    }

    spinChaosReel({
      reelKey: 'opener',
      startIndex: openerIndex,
      totalItems: chaos.openers.length,
      onPosition: setOpenerReelPosition,
      onVelocity: setOpenerSpinVelocity,
      onIndex: setOpenerIndex,
    })

    spinChaosReel({
      reelKey: 'descriptor',
      startIndex: descriptorIndex,
      totalItems: chaos.descriptors.length,
      onPosition: setDescriptorReelPosition,
      onVelocity: setDescriptorSpinVelocity,
      onIndex: setDescriptorIndex,
    })

    spinChaosReel({
      reelKey: 'topic',
      startIndex: topicIndex,
      totalItems: chaos.topics.length,
      onPosition: setTopicReelPosition,
      onVelocity: setTopicSpinVelocity,
      onIndex: setTopicIndex,
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
          position={safeReelPosition}
          isSpinning={isSpinning}
          spinVelocity={safeSpinVelocity}
          label="Safe Reel"
        />
      ) : (
        <div className="chaos-reels">
          <Reel
            items={chaos.openers}
            position={openerReelPosition}
            isSpinning={isOpenerSpinning}
            spinVelocity={openerSpinVelocity}
            label="Opener"
          />
          <Reel
            items={chaos.descriptors}
            position={descriptorReelPosition}
            isSpinning={isDescriptorSpinning}
            spinVelocity={descriptorSpinVelocity}
            label="Descriptor"
          />
          <Reel
            items={chaos.topics}
            position={topicReelPosition}
            isSpinning={isTopicSpinning}
            spinVelocity={topicSpinVelocity}
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
