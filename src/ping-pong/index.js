const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

count = 0

const FILE_PATH = "/data/pingpong.txt";
//Save the number of requests to "Ping-pong" application into a file in the volume and output it with the timestamp and hash when sending a request to our "Log output" application. In the end, the two pods should share a persistent volume between the two applications. So the browser should display the following when accessing the "Log output" application:

app.get('/pingpong', (req, res) => {
  count += 1
  res.send('pong ' + count)
  fs.writeFileSync(FILE_PATH, count.toString());
});

app.get('/pongs', (req, res) => {
  // return current count with json
  res.json({ count: count });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access status at http://localhost:${PORT}/ping`);
});
