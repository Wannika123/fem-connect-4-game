'use client'

import { createContext, useEffect, useState } from "react"

const TimerContext = createContext({
    time: 30, 
    done: false, 
    startTimer: () => {}, 
    pauseTimer: () => {}, 
    resumeTimer: () => {}
})

const TimerProvider = ({ children }: {
    children: React.ReactNode
}) => {
    const [time, setTime] = useState(30);
    const [paused, setPaused] = useState(false);
    const [done, setDone] = useState(false);

    const startTimer = () => {
        setTime(30);
        setDone(false);
        setPaused(false);
    }

    const pauseTimer = () => {
        setPaused(true);
    }

    const resumeTimer = () => {
        setPaused(false);
    }
    
    useEffect(() => {
        if (done) return

        const countdown = setInterval(() => {
            if (paused) {
                clearInterval(countdown);
                return;
            }
            if (time === 0) {
                clearInterval(countdown);
                setDone(true);
            } else {
                setTime(prev => prev - 1);
            }
        }, 1000)

        return () => { clearInterval(countdown) }
    }, [time, paused])
    
    return (
        <TimerContext.Provider value={{ time, done, startTimer, pauseTimer, resumeTimer }}>
            {children}
        </TimerContext.Provider>
    )
}

export { TimerContext, TimerProvider}