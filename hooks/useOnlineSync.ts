'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useGame } from '@/contexts/GameContext'

/**
 * Hook to subscribe to room_state changes in online mode
 * Automatically updates local game state when host broadcasts changes
 */
export function useOnlineSync() {
  const { gameState } = useGame()

  useEffect(() => {
    // Only subscribe in online mode
    if (gameState.mode !== 'online' || !gameState.roomId) return

    // Don't subscribe if we're still in lobby or setup
    if (gameState.phase === 'online-lobby' || gameState.phase === 'setup') return

    console.log(`[useOnlineSync] Subscribing to room_state for room ${gameState.roomId}`)

    const channel = supabase
      .channel(`room_state:${gameState.roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'room_state',
          filter: `room_id=eq.${gameState.roomId}`,
        },
        (payload) => {
          console.log('[useOnlineSync] Room state updated:', payload)
          // The actual state update will be handled by individual screens
          // This hook is mainly for triggering re-renders and logging
        }
      )
      .subscribe()

    return () => {
      console.log(`[useOnlineSync] Unsubscribing from room_state for room ${gameState.roomId}`)
      supabase.removeChannel(channel)
    }
  }, [gameState.mode, gameState.roomId, gameState.phase])
}

/**
 * Hook to subscribe to room_state and apply updates to local state
 * This version actually updates the game state based on Supabase changes
 */
export function useOnlineSyncWithStateUpdate() {
  const { gameState, setPhase } = useGame()

  useEffect(() => {
    // Only subscribe in online mode, and only for non-host players
    if (gameState.mode !== 'online' || !gameState.roomId || gameState.isHost) return

    // Don't subscribe if we're still in lobby or setup
    if (gameState.phase === 'online-lobby' || gameState.phase === 'setup') return

    console.log(`[useOnlineSyncWithStateUpdate] Subscribing to room_state for room ${gameState.roomId}`)

    const channel = supabase
      .channel(`room_state_sync:${gameState.roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'room_state',
          filter: `room_id=eq.${gameState.roomId}`,
        },
        (payload) => {
          console.log('[useOnlineSyncWithStateUpdate] Room state updated:', payload)

          const newState = payload.new as any

          // Update phase if it changed
          if (newState.phase && newState.phase !== gameState.phase) {
            console.log(`[useOnlineSyncWithStateUpdate] Phase changed to: ${newState.phase}`)
            setPhase(newState.phase)
          }

          // Individual screens will handle more specific state updates
        }
      )
      .subscribe()

    return () => {
      console.log(`[useOnlineSyncWithStateUpdate] Unsubscribing from room_state for room ${gameState.roomId}`)
      supabase.removeChannel(channel)
    }
  }, [gameState.mode, gameState.roomId, gameState.phase, gameState.isHost, setPhase])
}
