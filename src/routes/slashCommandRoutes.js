const express = require('express');
const handler = require('../handlers/slashCommandHandler');

const router = express.Router();

router.post('/lunch', handler.startRecommendLunch);
router.post('/lunch/interact', handler.interactLunch);
router.post('/lunch/new', handler.createLunchItem);

// Reserved for future expansion.
router.post('/mbti', handler.notImplemented);
router.post('/mbti/interact', handler.notImplemented);
router.post('/blind-vote', handler.notImplemented);
router.post('/blind-vote/interact', handler.notImplemented);
router.post('/akinator', handler.notImplemented);
router.post('/akinator/interact', handler.notImplemented);

module.exports = router;
