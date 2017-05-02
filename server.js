const express = require('express');
const path = require('path');

const port = process.env.PORT || 8000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Cykelsynten is listening on port ${port}`); // eslint-disable-line
});
