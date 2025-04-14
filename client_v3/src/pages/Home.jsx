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
          <small>并非不会卡😅</small>
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
          数据来源<a href="https://bgm.tv/">Bangumi</a>。<br/>
          <a href="https://space.bilibili.com/87983557">作者</a>：“实在对不起了大家，详情见……没有详情了，由于我制作网站时缺乏考虑，给bangumi带来了很大的负担。<br/>
          他们的管理员也很头大，所以我会暂时关闭网站，直到完成优化方案。感谢大家这段时间的热情和支持。”
        </p>
      </div>
    </div>
  );
};

export default Home; 
