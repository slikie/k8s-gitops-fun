const fs = require('fs');
const crypto = require('crypto');
const express = require('express');

const FILE_PATH_TIMESTAMP = "/data/timestamp.txt";
const FILE_PATH_PINGPONG = "/data/pingpong.txt";

function generateHash(timestamp) {
  return crypto.createHash('sha256').update(timestamp).digest('hex')
}

function generateTimestamp() {
  const timestamp = new Date().toISOString();
  const timestampHash = generateHash(timestamp);
  console.log(`${timestamp}:  ${timestampHash}`);
  return `${timestamp} - ${timestampHash}`;
}

function writeTimestampToFile(timestampStr) {
  fs.writeFileSync(FILE_PATH_TIMESTAMP, timestampStr);
}


function readPingPongFromFile() {
  try {
    data = fs.readFileSync(FILE_PATH_PINGPONG, 'utf8').trim();
    return {
      data
    };
  } catch (err) {
    console.log(err)
    return null;
  }
}

async function readPingPongFromUrl() {
  const response = await fetch(process.env.PING_PONG_SERVICE_URL);
  const data = await response.json();
  return data;
}

function readTimestampFromFile() {
  try {
    data = fs.readFileSync(FILE_PATH_TIMESTAMP, 'utf8').trim();
    return {
      timestamp: data.split(' - ')[0],
      hash: data.split(' - ')[1],
      status: 'success'
    };
  } catch (err) {
    console.log(err)
    return null;
  }
}

if (process.argv[2] === 'writer') {
  setInterval(() => {
    const timestampStr = generateTimestamp();
    writeTimestampToFile(timestampStr);
  }, 5000);
} else {
  // Default as reader 
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.get('/', async (req, res) => {
    const timestampStr = readTimestampFromFile();
    const pingpong = await readPingPongFromUrl();
    if (timestampStr) {
      const responseObject = {
        pingpongs: pingpong,
        ...timestampStr
      };
      res.json(responseObject);
    } else {
      res.send('Waiting for timestamp...');
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
