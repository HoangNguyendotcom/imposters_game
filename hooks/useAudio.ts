'use client'

import { useEffect, useRef, useState } from 'react'

export function useBackgroundMusic(enabled: boolean = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!enabled) return

    // Create audio element for background music
    // Using a data URL for a simple tone, or you can replace with actual music file
    const audio = new Audio()
    
    // Generate a simple background tone using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    let oscillator: OscillatorNode | null = null
    let gainNode: GainNode | null = null

    const startMusic = async () => {
      try {
        await audioContext.resume()
        
        oscillator = audioContext.createOscillator()
        gainNode = audioContext.createGain()
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime) // A3 note
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime) // Low volume
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.start()
        setIsPlaying(true)
      } catch (error) {
        console.error('Error starting background music:', error)
      }
    }

    const stopMusic = () => {
      if (oscillator) {
        oscillator.stop()
        oscillator.disconnect()
        oscillator = null
      }
      if (gainNode) {
        gainNode.disconnect()
        gainNode = null
      }
      setIsPlaying(false)
    }

    // Start music when enabled
    if (enabled) {
      startMusic()
    }

    return () => {
      stopMusic()
      audioContext.close()
    }
  }, [enabled])

  return { isPlaying }
}

export function useTimerSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const playTimerSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      // Create a beep sound
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.error('Error playing timer sound:', error)
    }
  }

  return { playTimerSound }
}

