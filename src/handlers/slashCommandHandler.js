const {
  pickRandomLunch,
  addLunchItem
} = require('../services/lunchService');
const {
  buildTextResponse,
  buildErrorResponse,
  buildLunchCardResponse
} = require('../utils/responseBuilder');

function startRecommendLunch(req, res, next) {
  try {
    const requester = String(req.body.user_name || req.query.user_name || 'teammate').trim();
    const recommendation = pickRandomLunch();

    return res.json(
      buildLunchCardResponse({
        title: 'Lunch Recommendation',
        description: `${requester}, how about ${recommendation.name}?`,
        metadata: {
          id: recommendation.id,
          name: recommendation.name,
          category: recommendation.category
        }
      })
    );
  } catch (error) {
    return next(error);
  }
}

function interactLunch(req, res) {
  return res.status(501).json(
    buildErrorResponse('Lunch interaction is not implemented yet.')
  );
}

function createLunchItem(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const category = String(req.body.category || '').trim();

    if (!name || !category) {
      return res.status(400).json(
        buildErrorResponse('name and category are required.')
      );
    }

    const item = addLunchItem({ name, category });

    return res.status(201).json(
      buildTextResponse(`Lunch item created: ${item.name} (${item.category})`)
    );
  } catch (error) {
    return next(error);
  }
}

function notImplemented(req, res) {
  return res.status(501).json(
    buildErrorResponse('This slash command is not implemented yet.')
  );
}

module.exports = {
  startRecommendLunch,
  interactLunch,
  createLunchItem,
  notImplemented
};
