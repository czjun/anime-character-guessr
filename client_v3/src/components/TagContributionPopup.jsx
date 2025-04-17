import '../styles/popups.css';
import { useState } from 'react';
import { submitCharacterTags, proposeCustomTags } from '../utils/db';

function TagContributionPopup({ character, onClose }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_TAGS = 6;
  const totalTags = selectedTags.length + customTags.length;

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else if (totalTags < MAX_TAGS) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleCustomTagAdd = () => {
    const trimmedTag = customTagInput.trim();
    if (!trimmedTag) {
      setInputError('标签不能为空');
      return;
    }
    if (trimmedTag.length > 8) {
      setInputError('标签最多8个字符');
      return;
    }
    if (customTags.includes(trimmedTag)) {
      setInputError('标签已存在');
      return;
    }
    if (totalTags >= MAX_TAGS) {
      setInputError(`最多只能添加${MAX_TAGS}个标签`);
      return;
    }
    setCustomTags(prev => [...prev, trimmedTag]);
    setCustomTagInput('');
    setInputError('');
  };

  const handleCustomTagRemove = (tagToRemove) => {
    setCustomTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomTagAdd();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Submit both selected and custom tags if they exist
      const submitPromises = [];
      
      if (selectedTags.length > 0) {
        submitPromises.push(submitCharacterTags(character.id, selectedTags));
      }
      
      if (customTags.length > 0) {
        submitPromises.push(proposeCustomTags(character.id, customTags));
      }
      
      await Promise.all(submitPromises);
      
      alert('感谢您的贡献！');
      onClose();
    } catch (error) {
      console.error('Error submitting tags:', error);
      alert('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tagGroups = {
    '发色': ['黑发', '金发', '白发', '粉发', '红发', '蓝发', '紫发', '绿发', '双色发', '渐变发'],
    '发型': ['双马尾', '单马尾', '短发', '长发', '黑长直', '卷发', '丸子头', '呆毛'],
    '瞳色': ['红瞳', '蓝瞳', '金瞳', '紫瞳', '绿瞳', '异色瞳', '黑瞳', '茶色瞳'],
    '服饰': ['眼镜', '耳机', '面具', '发带', '项链', '制服', '和服'],
    '性格': ['傲娇', '天然呆', '元气', '温柔', '高冷', '腹黑', '中二', '病娇']
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>×</button>
        <div className="popup-header">
          <h2>为 {character.nameCn} 贡献标签</h2>
        </div>
        <div className="popup-body">
          <div className="tag-contribution-container">
            <div className="character-preview">
              <img 
                src={character.image} 
                alt={character.name} 
                className="character-preview-image"
              />
              <div className="character-preview-info">
                <div className="character-preview-name">{character.name}</div>
                <div className="character-preview-name-cn">{character.nameCn}</div>
              </div>
              <div className="author-notes">
                为角色贡献标签，帮助其他玩家更容易猜到TA。<br />
                请负责任地选择或添加，避免使用重复、无关或者过于稀有的标签。<br/>
                可以参考:萌娘百科角色页的“萌点”、Bangumi番剧页的标签，或者其他有助于过滤的属性。<br/>
                声优名字一定有的，所以不用添加。<br/>
                每次最多可以贡献6个标签。<br/>
                现在是什么情况？这几天先收集一下投票，之后就会加入到游戏里。谢谢大家。
              </div>
            </div>
            <div className="tag-input-section">
              <div className="tag-groups">
                {Object.entries(tagGroups).map(([groupName, tags]) => (
                  <div key={groupName} className="tag-group">
                    <h4 className="tag-group-title">{groupName}</h4>
                    <div className="tag-list">
                      {tags.map(tag => (
                        <button
                          key={tag}
                          className={`tag-suggestion ${selectedTags.includes(tag) ? 'selected' : ''} ${totalTags >= MAX_TAGS && !selectedTags.includes(tag) ? 'disabled' : ''}`}
                          onClick={() => handleTagClick(tag)}
                          disabled={totalTags >= MAX_TAGS && !selectedTags.includes(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="tag-group">
                  <h4 className="tag-group-title">自定义标签</h4>
                  <div className="custom-tag-input">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="添加自定义标签（最多8字符）"
                      maxLength={8}
                      className={inputError ? 'has-error' : ''}
                      disabled={totalTags >= MAX_TAGS}
                    />
                    <button 
                      onClick={handleCustomTagAdd}
                      disabled={totalTags >= MAX_TAGS}
                    >
                      添加
                    </button>
                  </div>
                  {inputError && <div className="input-error">{inputError}</div>}
                  {customTags.length > 0 && (
                    <div className="custom-tags-list">
                      {customTags.map(tag => (
                        <div key={tag} className="custom-tag">
                          <span>{tag}</span>
                          <button onClick={() => handleCustomTagRemove(tag)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="popup-footer">
          <button 
            className="submit-tags-btn" 
            disabled={totalTags === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? '提交中...' : `提交标签 (${totalTags}/${MAX_TAGS})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TagContributionPopup; 
