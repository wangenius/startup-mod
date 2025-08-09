import EventGeneration from "./components/EventGeneration";
import GameLoadingPage from "./components/GameLoadingPage";
import GameLobby from "./components/GameLobby";
import GamePlay from "./components/GamePlay";
import GameResult from "./components/GameResult";
import { InitialPage } from "./components/InitialPage";
import RoleSelection from "./components/RoleSelection";
import RoomManager from "./components/RoomManager";
import RoundLoadingPage from "./components/RoundLoadingPage";
import WelcomePage from "./components/WelcomePage";
import { useGame } from "./context/GameContextCore";
import { GAME_STATES } from "./const/const";

function App() {
  const {
    gameState,
    playerName,
    currentRoom,
    players,
    currentRound,
    roundEvent,
    privateMessages,
    playerActions,
    gameResult,
    selectedRoles,
    waitingForPlayers,
    gameBackground,
    roleDefinitions,
    handleInitialPageClick,
    handlePlayerNameSet,
    handleRoomAction,
    handleStartupIdeaSubmit,
    handleRoleSelect,
    handleActionSubmit,
    handleEventGenerated,
    handleStartRound,
    handleLoadingComplete,
    handleRestartGame,
  } = useGame();

  const renderCurrentState = () => {
    switch (gameState) {
      case GAME_STATES.INITIAL:
        return <InitialPage onClick={handleInitialPageClick} />;
      case GAME_STATES.WELCOME:
        return <WelcomePage onPlayerNameSet={handlePlayerNameSet} />;
      case GAME_STATES.ROOM_SELECTION:
        return (
          <RoomManager
            playerName={playerName}
            onRoomAction={handleRoomAction}
          />
        );
      case GAME_STATES.LOBBY: {
        const currentPlayer = players.find((p) => p.name === playerName);
        const isHost = currentPlayer?.isHost || false;
        return (
          <GameLobby
            roomId={currentRoom}
            players={players}
            playerName={playerName}
            onStartupIdeaSubmit={handleStartupIdeaSubmit}
            isHost={isHost}
          />
        );
      }
      case GAME_STATES.ROLE_SELECTION:
        return (
          <RoleSelection
            players={players}
            playerName={playerName}
            onRoleSelect={handleRoleSelect}
            selectedRoles={selectedRoles}
            gameBackground={gameBackground}
            roleDefinitions={roleDefinitions}
          />
        );
      case GAME_STATES.LOADING:
        return (
          <GameLoadingPage
            playerName={playerName}
            gameBackground={gameBackground}
            roleDefinitions={roleDefinitions}
            onLoadingComplete={handleLoadingComplete}
          />
        );
      case GAME_STATES.ROUND_LOADING:
        return (
          <RoundLoadingPage
            roomId={currentRoom}
            playerName={playerName}
            currentRound={currentRound}
            loadingMessage={null}
          />
        );
      case GAME_STATES.EVENT_GENERATION:
        return (
          <EventGeneration
            playerName={playerName}
            currentRound={currentRound}
            onEventGenerated={handleEventGenerated}
            onStartRound={handleStartRound}
          />
        );
      case GAME_STATES.PLAYING:
        return (
          <GamePlay
            gameState={{ players }}
            playerName={playerName}
            currentRound={currentRound}
            roundEvent={roundEvent}
            privateMessages={privateMessages}
            onActionSubmit={handleActionSubmit}
            waitingForPlayers={waitingForPlayers}
            playerActions={playerActions}
          />
        );
      case GAME_STATES.ROUND_RESULT:
        return null;
      case GAME_STATES.RESULT:
        return (
          <GameResult
            gameResult={gameResult}
            players={players}
            onRestart={handleRestartGame}
          />
        );
      default:
        return <WelcomePage onPlayerNameSet={handlePlayerNameSet} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <div className="flex-1 w-full max-w-md mx-auto">
        {renderCurrentState()}
      </div>
    </div>
  );
}

export default App;
