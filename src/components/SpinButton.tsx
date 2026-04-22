interface SpinButtonProps {
  onSpin: () => void
  disabled: boolean
}

function SpinButton({ onSpin, disabled }: SpinButtonProps) {
  return (
    <button
      type="button"
      className="spin-button"
      onClick={onSpin}
      disabled={disabled}
      aria-label="Spin the reel and get a question"
    >
      SPIN
    </button>
  )
}

export default SpinButton
