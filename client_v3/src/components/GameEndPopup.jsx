import '../styles/popups.css';
import subaruIcon from '../assets/subaru.jpg';
import { useState } from 'react';
import TagContributionPopup from './TagContributionPopup';

function GameEndPopup({ result, answer, onClose }) {
  const [showTagPopup, setShowTagPopup] = useState(false);

  if (showTagPopup) {
    return (
      <TagContributionPopup 
        character={answer}
        onClose={() => {
          setShowTagPopup(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>×</button>
        <div className="popup-header">
          <h2>{result === 'win' ? '🎉 给你猜对了，有点东西' : '😢 已经结束咧'}</h2>
        </div>
        <div className="popup-body">
          <div className="answer-character">
            <img 
              src={answer.image} 
              alt={answer.name} 
              className="answer-character-image"
            />
            <div className="answer-character-info">
              <div className="character-name-container">
                <a 
                  href={`https://bgm.tv/character/${answer.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="character-link"
                >
                  <div className="answer-character-name">{answer.name}</div>
                  <div className="answer-character-name-cn">{answer.nameCn}</div>
                </a>
                <div className="button-container">
                  <button 
                    className="contribute-tag-btn" 
                    onClick={() => setShowTagPopup(true)}
                  >
                    贡献标签
                  </button>
                  <img src={subaruIcon} alt="" className="button-icon" />
                </div>
              </div>
              {answer.summary && (
                <div className="answer-summary">
                  <div className="summary-content">{answer.summary}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameEndPopup; 