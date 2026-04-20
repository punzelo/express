const express = require('express');
const slashCommandRoutes = require('./routes/slashCommandRoutes');
const { buildErrorResponse, buildTextResponse } = require('./utils/responseBuilder');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json(buildTextResponse('slash-command express api is running'));
});

app.use('/slash-command', slashCommandRoutes);

app.use((req, res) => {
  res.status(404).json(buildErrorResponse(`Not found: ${req.path}`));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(
    buildErrorResponse(
      process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
    )
  );
});

module.exports = app;
