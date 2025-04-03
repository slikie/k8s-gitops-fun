const { v4: uuidv4 } = require('uuid');
const express = require('express');

const appUUID = uuidv4();
const app = express();
const PORT = process.env.PORT || 3000;

function logUUIDWithTimestamp() {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}:  ${appUUID}`);
}


function getCurrentStatus() {
  return {
    uuid: appUUID,
    timestamp: new Date().toISOString(),
    status: 'success'
  };
}


app.get('/status', (req, res) => {
  res.json(getCurrentStatus());
});


logUUIDWithTimestamp();

setInterval(logUUIDWithTimestamp, 5000);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access status at http://localhost:${PORT}/status`);
});
