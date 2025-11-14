'use client'

import { GameProvider, useGame } from '@/contexts/GameContext'
import SetupScreen from '@/components/SetupScreen'
import NameCollectionScreen from '@/components/NameCollectionScreen'
import RoleAssignmentScreen from '@/components/RoleAssignmentScreen'
import ActiveGameRound from '@/components/ActiveGameRound'
import VotingScreen from '@/components/VotingScreen'
import RevealEliminatedScreen from '@/components/RevealEliminatedScreen'
import ResultsScreen from '@/components/ResultsScreen'

function GameContent() {
  const { gameState } = useGame()

  switch (gameState.phase) {
    case 'setup':
      return <SetupScreen />
    case 'names':
      return <NameCollectionScreen />
    case 'reveal-roles':
      return <RoleAssignmentScreen />
    case 'playing':
      return <ActiveGameRound />
    case 'voting':
      return <VotingScreen />
    case 'reveal-eliminated':
      return <RevealEliminatedScreen />
    case 'results':
      return <ResultsScreen />
    default:
      return <SetupScreen />
  }
}

export default function Home() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}
