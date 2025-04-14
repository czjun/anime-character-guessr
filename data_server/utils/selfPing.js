const axios = require('axios');

const PING_INTERVAL = 14.5 * 60 * 1000; // 14 minutes in milliseconds

const pingServer = () => {
  axios.get(`https://anime-character-guessr.onrender.com/ping`)
    .then(response => console.log('Self-ping successful:', response.status))
    .catch(error => console.error('Self-ping failed:', error.message));
};

const startSelfPing = () => {
  // Start the self-ping interval
  setInterval(pingServer, PING_INTERVAL);
  console.log('Self-ping mechanism started');
};

module.exports = {
  startSelfPing,
  pingServer
}; 