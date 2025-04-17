import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/Home.css';

const Home = () => {
  const [roomCount, setRoomCount] = useState(0);

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    fetch(`${serverUrl}/room-count`)
      .then(response => response.json())
      .then(data => setRoomCount(data.count))
      .catch(error => console.error('Error fetching room count:', error));
  }, []);

  return (
    <div className="home-container">
      <div className="game-modes">
        <Link to="/singleplayer" className="mode-button">
          <h2>单人</h2>
        </Link>
        <Link to="/multiplayer" className="mode-button">
          <h2>多人</h2>
          <small>当前房间数: {roomCount}/259</small>
        </Link>
      </div>
      <div className="home-footer">
        <p>
          一个猜动漫角色的游戏,
          建议使用桌面端浏览器游玩。
          <br/>
          灵感来源<a href="https://blast.tv/counter-strikle">BLAST.tv</a>,
          数据来源<a href="https://bgm.tv/">Bangumi</a>。<br />
          <a href="https://space.bilibili.com/87983557">作者</a>：“感谢 Bangumi 管理员的优化支持，以及各位网友贡献的代码。感谢大家这段时间的热情和支持。<br/>
          角色标签暂时用了大佬分享的爬虫数据，之后会换成大家贡献的标签的。祝大家玩得开心！”<br/>
          另：由于标签覆盖范围问题，用灰色标签排除不一定准确，请尽量参考绿色标签。
        </p>
      </div>
    </div>
  );
};

export default Home; 
