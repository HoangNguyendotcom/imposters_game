'use client'

import { useEffect, useRef } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function AudioManager() {
  const { gameState } = useGame()
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)
  const timerSoundRef = useRef<HTMLAudioElement | null>(null)
  const previousPhaseRef = useRef(gameState.phase)
  const previousPlayerIndexRef = useRef(gameState.currentPlayerIndex)

  // Initialize background music
  useEffect(() => {
    if (!backgroundMusicRef.current) {
      const audio = new Audio('/audio/background-music.mp3')
      audio.loop = true
      audio.volume = 0.3 // 30% volume
      audio.preload = 'auto'
      backgroundMusicRef.current = audio
      
      // Start playing immediately (from setup screen)
      audio.play().catch((error) => {
        console.log('Background music autoplay prevented:', error)
      })
    }
  }, [])

  // Initialize timer sound
  useEffect(() => {
    if (!timerSoundRef.current) {
      const audio = new Audio('/audio/timer-ticks.mp3')
      audio.loop = true // Loop the timer sound
      audio.volume = 0.5 // 50% volume
      audio.preload = 'auto'
      timerSoundRef.current = audio
    }
  }, [])

  // Continuously monitor gameState and manage audio
  useEffect(() => {
    const bgMusic = backgroundMusicRef.current
    const timerSound = timerSoundRef.current
    if (!bgMusic || !timerSound) return

    const isPlayingPhase = gameState.phase === 'playing'
    const isTimerRunning = isPlayingPhase && gameState.playerTurnTimer > 0 && gameState.roundDuration > 0
    const phaseChanged = previousPhaseRef.current !== gameState.phase
    const playerChanged = previousPlayerIndexRef.current !== gameState.currentPlayerIndex

    // If phase changed away from 'playing', immediately stop timer sound
    if (phaseChanged && previousPhaseRef.current === 'playing' && gameState.phase !== 'playing') {
      timerSound.pause()
      timerSound.currentTime = 0
    }

    if (isTimerRunning) {
      // Timer is running: stop background music, play timer sound
      bgMusic.pause()
      
      // If player changed or timer sound is paused, restart the timer sound
      if (playerChanged || timerSound.paused) {
        timerSound.currentTime = 0
        timerSound.play().catch((error) => {
          console.error('Error playing timer sound:', error)
        })
      }
    } else {
      // Timer is not running: stop timer sound, play background music
      timerSound.pause()
      timerSound.currentTime = 0

      // Play background music on all screens except results
      const shouldPlayBgMusic = gameState.phase !== 'results'
      
      if (shouldPlayBgMusic) {
        if (bgMusic.paused) {
          bgMusic.play().catch((error) => {
            console.log('Background music autoplay prevented:', error)
          })
        }
      } else {
        bgMusic.pause()
        bgMusic.currentTime = 0
      }
    }

    // Update previous phase and player index
    previousPhaseRef.current = gameState.phase
    previousPlayerIndexRef.current = gameState.currentPlayerIndex
  }, [gameState.phase, gameState.playerTurnTimer, gameState.roundDuration, gameState.currentPlayerIndex])

  return null // This component doesn't render anything
}
