const fs = require('fs');
const crypto = require('crypto');
const express = require('express');

//const FILE_PATH = "/data/timestamp.txt";
// for local debug
const FILE_PATH = "./timestamp.txt";


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
  fs.writeFileSync(FILE_PATH, timestampStr);
}

function readTimestampFromFile() {
  try {
	data = fs.readFileSync(FILE_PATH, 'utf8').trim();
  	return {
    	timestamp: data.split(' - ')[0],
	hash: data.split(' - ')[1],
    	status: 'success'
  		};
  } catch (err) {
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
    const PORT = 3000;

    app.get('/', (req, res) => {
        const timestampStr = readTimestampFromFile();
        if (timestampStr) {
		res.json(timestampStr)
        } else {
            res.send('Waiting for timestamp...');
        }
    });

    app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
    });
}
