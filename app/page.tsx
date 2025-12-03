'use client'

import { GameProvider, useGame } from '@/contexts/GameContext'
import SetupScreen from '@/components/SetupScreen'
import NameCollectionScreen from '@/components/NameCollectionScreen'
import OnlineLobbyScreen from '@/components/OnlineLobbyScreen'
import RoleAssignmentScreen from '@/components/RoleAssignmentScreen'
import ActiveGameRound from '@/components/ActiveGameRound'
import VotingScreen from '@/components/VotingScreen'
import RevealEliminatedScreen from '@/components/RevealEliminatedScreen'
import ImposterGuessScreen from '@/components/ImposterGuessScreen'
import ResultsScreen from '@/components/ResultsScreen'
import AudioManager from '@/components/AudioManager'
import HistoryButton from '@/components/HistoryButton'

function GameContent() {
  const { gameState } = useGame()

  switch (gameState.phase) {
    case 'setup':
      return <SetupScreen />
    case 'online-lobby':
      return <OnlineLobbyScreen />
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
    case 'imposter-guess':
      return <ImposterGuessScreen />
    case 'results':
      return <ResultsScreen />
    default:
      return <SetupScreen />
  }
}

export default function Home() {
  return (
    <GameProvider>
      <HistoryButton />
      <AudioManager />
      <GameContent />
    </GameProvider>
  )
}
