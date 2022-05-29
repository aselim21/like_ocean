const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
app.use(express.static("src"));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
  });