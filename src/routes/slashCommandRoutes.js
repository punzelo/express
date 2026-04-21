const express = require('express');
const handler = require('../handlers/slashCommandHandler');

const router = express.Router();

router.post('/lunch', handler.startRecommendLunch);
router.post('/lunch/interact', handler.interactLunch);
router.post('/lunch/new', handler.createLunchItem);

router.post('/mbti', handler.startMbti);
router.post('/mbti/interact', handler.interactMbti);

router.post('/blind-vote', handler.createBlindVote);
router.post('/blind-vote/interact', handler.interactBlindVote);

router.post('/akinator', handler.notImplemented);
router.post('/akinator/interact', handler.notImplemented);

module.exports = router;
