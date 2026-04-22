import './App.css'
import SlotMachine from './components/SlotMachine'

function App() {
  return (
    <div className="app-shell">
      <header className="title-chrome">
        <p className="title-kicker">Networking Jackpot</p>
        <h1>IceBreaker 2000</h1>
        <p className="title-subtitle">Vegas slot machine meets Y2K internet chaos.</p>
      </header>

      <main>
        <SlotMachine />
      </main>
    </div>
  )
}

export default App
