import { useState } from 'react'
import './App.css'

function App() {
    const [count, setCount] = useState(0)
    const [animate, setAnimate] = useState(false)

    const handleIncrement = () => {
        setCount(prev => prev + 1);
        setAnimate(true)
        setTimeout(() => setAnimate(false), 100)
    }

    return (
        <div className="fullscreen-container" onPointerDown={handleIncrement}>
            <div className={`counter-display ${animate ? 'animate' : ''}`}>
                <h1>{count}</h1>
                <p>REPS DONE</p>
            </div>
        </div>
    )
}

export default App