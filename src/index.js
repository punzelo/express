const express = require('express');
const slashCommandRoutes = require('./routes/slashCommandRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'dooray slash-command api is running' });
});

app.use('/slash-command', slashCommandRoutes);

module.exports = app;
