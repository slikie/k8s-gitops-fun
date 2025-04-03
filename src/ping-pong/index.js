const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

count = 0

app.get('/', (req, res) => {
  count += 1
  res.send('pong ' + count)
});

app.get('/pingpong', (req, res) => {
  count += 1
  res.send('pong ' + count)
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access status at http://localhost:${PORT}/ping`);
});
