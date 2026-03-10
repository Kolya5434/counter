import { useRef, useState } from 'react'
import './App.css'

function App() {
    const [count, setCount] = useState(0)
    const [animate, setAnimate] = useState(false)
    const [isHolding, setIsHolding] = useState(false)
    const resetTimeoutRef = useRef(null)

    const handleIncrement = (e) => {
        if (e.target.closest('.reset-btn')) return; // Don't count if clicking reset
        setCount(prev => prev + 1)
        setAnimate(true)
        setTimeout(() => setAnimate(false), 100)
    }

    const clearResetTimeout = () => {
        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current)
            resetTimeoutRef.current = null
        }
        setIsHolding(false)
    }

    const handleResetPointerDown = (e) => {
        e.stopPropagation()

        if (count === 0) return

        setIsHolding(true)

        resetTimeoutRef.current = setTimeout(() => {
            setCount(0)
            setAnimate(false)
            setIsHolding(false)
            resetTimeoutRef.current = null
        }, 600)
    }

    const handleResetPointerUp = (e) => {
        e.stopPropagation()
        clearResetTimeout()
    }

    const handleResetPointerLeave = () => {
        clearResetTimeout()
    }

    return (
        <div className="fullscreen-container" onPointerDown={handleIncrement}>
            <div className={`hold-progress ${isHolding ? 'active' : ''}`} />

            <div className={`counter-display ${animate ? 'animate' : ''}`}>
                <h1>{count}</h1>
                <p>REPS DONE</p>
            </div>

            <button
                className="reset-btn"
                onPointerDown={handleResetPointerDown}
                onPointerUp={handleResetPointerUp}
                onPointerLeave={handleResetPointerLeave}
                onPointerCancel={clearResetTimeout}
                disabled={count === 0}
            >
                Hold to Reset
            </button>
        </div>
    )
}

export default App