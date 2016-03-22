const express = require('express');
const path = require('path');

const app = express();

const port = process.env.PORT || 1337;
const publicPath = path.resolve(__dirname, 'public');
const distPath = path.resolve(__dirname, 'dist');

app.use(express.static(publicPath));
app.use(express.static(distPath));

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
