const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
app.use(express.static("src"));
const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src', 'index.html'));
});
app.get('/ocean/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../src', 'ocean.html'));
});

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});