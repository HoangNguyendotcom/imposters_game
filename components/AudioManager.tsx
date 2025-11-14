'use client'

import { useEffect, useRef } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function AudioManager() {
  const { gameState } = useGame()
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)
  const timerSoundRef = useRef<HTMLAudioElement | null>(null)
  const timerSoundPlayedRef = useRef(false)
  const previousTimerRef = useRef(gameState.playerTurnTimer)

  // Initialize background music
  useEffect(() => {
    if (!backgroundMusicRef.current) {
      const audio = new Audio('/audio/background-music.mp3')
      audio.loop = true
      audio.volume = 0.3 // 30% volume (adjust as needed)
      audio.preload = 'auto'
      backgroundMusicRef.current = audio
    }
  }, [])

  // Initialize timer sound
  useEffect(() => {
    if (!timerSoundRef.current) {
      const audio = new Audio('/audio/timer-ticks.mp3')
      audio.volume = 0.5 // 50% volume (adjust as needed)
      audio.preload = 'auto'
      timerSoundRef.current = audio
    }
  }, [])

  // Background music - play during active game phases
  useEffect(() => {
    const audio = backgroundMusicRef.current
    if (!audio) return

    const shouldPlay = ['names', 'reveal-roles', 'voting', 'reveal-eliminated'].includes(gameState.phase)
    
    if (shouldPlay) {
      // Try to play music (may require user interaction due to browser autoplay policies)
      audio.play().catch((error) => {
        // Autoplay was prevented - this is normal, user needs to interact first
        console.log('Background music autoplay prevented:', error)
      })
    } else {
      audio.pause()
      audio.currentTime = 0
    }
  }, [gameState.phase])

  // Timer sound effect - play when timer reaches 0
  useEffect(() => {
    const audio = timerSoundRef.current
    
    if (gameState.phase === 'playing') {
      if (!timerSoundPlayedRef.current) {
        // Play sound when in playing phase
        if (audio) {
          audio.currentTime = 0 // Reset to beginning
          audio.play().catch((error) => {
            console.error('Error playing timer sound:', error)
          })
          timerSoundPlayedRef.current = true
        }
      }

      // Reset timer sound flag when timer resets
      if (gameState.playerTurnTimer > 0) {
        timerSoundPlayedRef.current = false
      }
    } else {
      // Stop sound when changing to other phases
      if (audio && !audio.paused) {
        audio.pause()
        audio.currentTime = 0
      }
      timerSoundPlayedRef.current = false
    }

    previousTimerRef.current = gameState.playerTurnTimer
  }, [gameState.playerTurnTimer, gameState.phase])

  return null // This component doesn't render anything
}
