import '../styles/game.css';

function GameInfo({ gameEnd, guessesLeft, onRestart, answerCharacter, hints }) {
  const showFirstHint = guessesLeft <= 5;
  const showSecondHint = guessesLeft <= 2;

  return (
    <div className="game-info">
      {gameEnd ? (
        <button className="restart-button" onClick={onRestart}>
          再玩一次
        </button>
      ) : (
        <div className="game-info-container">
          <span>剩余次数: {guessesLeft}</span>
          {showFirstHint && (
            <div className="hint-container">
              <span className="hint-label">提示 1:</span>
              <span className="hint-text">{hints.first}</span>
            </div>
          )}
          {showSecondHint && (
            <div className="hint-container">
              <span className="hint-label">提示 2:</span>
              <span className="hint-text">{hints.second}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GameInfo; 