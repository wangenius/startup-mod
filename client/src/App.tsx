import EventGeneration from "./components/EventGeneration";
import GameLoadingPage from "./components/GameLoadingPage";
import IdeaPickerInRoom from "./components/room/IdeaPickerInRoom";
import GamePlay from "./components/gameplay/GamePlay";
import GameResult from "./components/GameResult";
import { InitialPage } from "./components/InitialPage";
import RoleSelection from "./components/roleSelection/RoleSelection";
import RoomEntrance from "./components/room/RoomEntrance";
import RoundLoadingPage from "./components/RoundLoadingPage";
import UserNamePage from "./components/WelcomePage";
import { GAME_STATES } from "./const/const";
import { useGame } from "./context/GameContextCore";

function App() {
  const { gameState } = useGame();

  const renderCurrentState = () => {
    switch (gameState) {
      case GAME_STATES.INITIAL:
        return <InitialPage />;
      case GAME_STATES.WELCOME:
        return <UserNamePage />;
      case GAME_STATES.ROOM_SELECTION:
        return <RoomEntrance />;
      case GAME_STATES.LOBBY:
        return <IdeaPickerInRoom />;
      case GAME_STATES.ROLE_SELECTION:
        return <RoleSelection />;
      case GAME_STATES.LOADING:
        return <GameLoadingPage />;
      case GAME_STATES.ROUND_LOADING:
        return <RoundLoadingPage />;
      case GAME_STATES.EVENT_GENERATION:
        return <EventGeneration />;
      case GAME_STATES.PLAYING:
        return <GamePlay />;
      case GAME_STATES.ROUND_RESULT:
        return null;
      case GAME_STATES.RESULT:
        return <GameResult />;
      default:
        return <UserNamePage />;
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
