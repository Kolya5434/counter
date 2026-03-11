import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

function getMonthKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function loadRecords() {
    try {
        const raw = document.cookie
            .split('; ')
            .find(c => c.startsWith('counter_records='))
        if (!raw) return {}
        return JSON.parse(decodeURIComponent(raw.split('=')[1]))
    } catch {
        return {}
    }
}

function saveRecords(records) {
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 5)
    document.cookie = `counter_records=${encodeURIComponent(JSON.stringify(records))};expires=${expires.toUTCString()};path=/`
}

function App() {
    const [count, setCount] = useState(0)
    const [holdDuration, setHoldDuration] = useState(() => {
        try {
            const saved = document.cookie.split('; ').find(c => c.startsWith('counter_duration='))
            return saved ? Number(saved.split('=')[1]) : 500
        } catch {
            return 500
        }
    })
    const [isHolding, setIsHolding] = useState(false)
    const [flash, setFlash] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [draftDuration, setDraftDuration] = useState(holdDuration)
    const [records, setRecords] = useState(loadRecords)

    const holdTimerRef = useRef(null)

    const currentMonth = getMonthKey()
    const currentMonthBest = records[currentMonth] || 0
    const allTimeBest = Object.values(records).length > 0
        ? Math.max(...Object.values(records))
        : 0

    const clearHold = useCallback(() => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current)
            holdTimerRef.current = null
        }
        setIsHolding(false)
    }, [])

    const handlePointerDown = (e) => {
        if (e.target.closest('.top-bar')) return
        setIsHolding(true)
        holdTimerRef.current = setTimeout(() => {
            setCount(prev => prev + 1)
            setFlash(true)
            setTimeout(() => setFlash(false), 300)
            holdTimerRef.current = null
            setIsHolding(false)
        }, holdDuration)
    }

    const handlePointerUp = (e) => {
        if (e.target.closest('.top-bar')) return
        clearHold()
    }

    const handlePointerLeave = () => {
        clearHold()
    }

    useEffect(() => {
        return () => {
            if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
        }
    }, [])

    const handleSaveSettings = () => {
        const val = Math.max(100, Math.min(5000, Number(draftDuration) || 500))
        setHoldDuration(val)
        setDraftDuration(val)
        const expires = new Date()
        expires.setFullYear(expires.getFullYear() + 5)
        document.cookie = `counter_duration=${val};expires=${expires.toUTCString()};path=/`
        setShowSettings(false)
    }

    const handleDone = () => {
        if (count === 0) return
        const updated = { ...records }
        const key = getMonthKey()
        if (!updated[key] || count > updated[key]) {
            updated[key] = count
        }
        saveRecords(updated)
        setRecords(updated)
        setCount(0)
    }

    return (
        <div
            className={`fullscreen-container ${flash ? 'flash-green' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={clearHold}
        >
            <div className={`hold-overlay ${isHolding ? 'active' : ''}`}
                 style={{ '--hold-duration': `${holdDuration}ms` }} />

            <div className="top-bar">
                <button className="icon-btn" onPointerDown={(e) => {
                    e.stopPropagation()
                    setDraftDuration(holdDuration)
                    setShowSettings(true)
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                </button>

                <div className="best-result">
                    <span className="best-label">Best</span>
                    <span className="best-value">{allTimeBest}</span>
                    <span className="best-month">({currentMonth}: {currentMonthBest})</span>
                </div>

                <button className="icon-btn done-btn" onPointerDown={(e) => {
                    e.stopPropagation()
                    handleDone()
                }} disabled={count === 0}>
                    Done
                </button>
            </div>

            <div className="counter-display">
                <h1>{count}</h1>
                <p>REPS DONE</p>
            </div>

            {showSettings && (
                <div className="dialog-overlay" onPointerDown={(e) => {
                    e.stopPropagation()
                    setShowSettings(false)
                }}>
                    <div className="dialog" onPointerDown={(e) => e.stopPropagation()}>
                        <h2>Settings</h2>
                        <label>
                            Hold duration (ms)
                            <input
                                type="number"
                                min="100"
                                max="5000"
                                step="50"
                                value={draftDuration}
                                onChange={(e) => setDraftDuration(e.target.value)}
                            />
                        </label>
                        <div className="dialog-actions">
                            <button onClick={() => setShowSettings(false)}>Cancel</button>
                            <button className="primary" onClick={handleSaveSettings}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App