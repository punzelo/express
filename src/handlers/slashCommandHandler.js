const lunchService = require('../services/lunchService');
const mbtiService = require('../services/mbtiService');
const blindVoteService = require('../services/blindVoteService');
const {
  buildDoorayText,
  buildDoorayLunchMessage,
  buildDoorayRegisteredMessage,
  buildDoorayError,
  buildDoorayAccepted,
  buildDoorayMbtiQuestionMessage,
  buildDoorayMbtiResultMessage,
  buildDoorayMbtiStatsMessage,
  buildDoorayBlindVoteMessage,
  buildDoorayBlindVoteResultMessage
} = require('../utils/responseBuilder');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function waitUntil(promise) {
  promise.catch((error) => {
    console.error('Background task failed:', error);
  });
}

async function postToDoorayResponseUrl(responseUrl, payload) {
  const response = await fetch(responseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Dooray responseUrl POST failed with status ${response.status}`);
  }
}

function verifyAppToken(req) {
  const expectedToken = process.env.DOORAY_APP_TOKEN;

  if (!expectedToken) {
    return true;
  }

  return (req.body || {}).appToken === expectedToken;
}

function parseLunchNewText(rawText = '') {
  const [nameRaw, categoryRaw] = rawText.split('|');
  const name = (nameRaw || '').trim();
  const category = (categoryRaw || '기타').trim();

  return { name, category };
}

async function sendDelayedMbtiStart({ responseUrl, userId }) {
  await sleep(250);

  try {
    const session = mbtiService.createSession(userId);
    const question = mbtiService.getCurrentQuestion(session.id);

    await postToDoorayResponseUrl(
      responseUrl,
      buildDoorayMbtiQuestionMessage({
        sessionId: session.id,
        question,
        step: 1,
        total: 4
      })
    );
  } catch (error) {
    await postToDoorayResponseUrl(
      responseUrl,
      buildDoorayError(error.message || 'MBTI 시작 중 오류가 발생했습니다.')
    );
  }
}

async function sendDelayedBlindVoteStart({ responseUrl, creatorId, rawText }) {
  await sleep(250);

  try {
    const parsed = blindVoteService.parseVoteText(rawText);

    const poll = blindVoteService.createPoll({
      creatorId,
      question: parsed.question,
      options: parsed.options,
      revealProgress: parsed.revealProgress
    });

    await postToDoorayResponseUrl(
      responseUrl,
      buildDoorayBlindVoteMessage(poll, {
        responseType: 'inChannel',
        text: parsed.revealProgress
          ? '익명 투표가 생성되었습니다. 중간 결과 공개: ON'
          : '익명 투표가 생성되었습니다. 중간 결과 공개: OFF'
      })
    );
  } catch (error) {
    await postToDoorayResponseUrl(
      responseUrl,
      buildDoorayError(error.message || '익명 투표 생성 중 오류가 발생했습니다.')
    );
  }
}

async function startRecommendLunch(req, res) {
  try {
    if (!verifyAppToken(req)) {
      return res.status(401).json(buildDoorayError('유효하지 않은 appToken 입니다.'));
    }

    const filterText = (req.body || {}).text || '';
    const menu = lunchService.pickRandomLunch(filterText);

    return res.status(200).json(
      buildDoorayLunchMessage(menu, {
        responseType: 'ephemeral',
        text: filterText
          ? `조건 "${filterText}" 에 맞춰 추천했어요.`
          : '오늘의 점심 추천입니다.'
      })
    );
  } catch (error) {
    return res.status(200).json(buildDoorayError(error.message));
  }
}

async function interactLunch(req, res) {
  try {
    if (!verifyAppToken(req)) {
      return res.status(401).json(buildDoorayError('유효하지 않은 appToken 입니다.'));
    }

    const actionValue = (req.body || {}).actionValue || '';
    const actionText = (req.body || {}).actionText || '';
    const callbackId = (req.body || {}).callbackId || '';

    if (actionValue === 'retry') {
      const menu = lunchService.pickRandomLunch();

      return res.status(200).json(
        buildDoorayLunchMessage(menu, {
          responseType: 'ephemeral',
          replaceOriginal: true,
          text: '다시 추천해드릴게요.'
        })
      );
    }

    if (actionValue.startsWith('confirm:')) {
      const menuId = actionValue.split(':')[1];
      const menu = lunchService.findById(menuId);

      if (!menu) {
        return res
          .status(200)
          .json(buildDoorayError('확정할 메뉴를 찾을 수 없습니다.'));
      }

      return res.status(200).json({
        responseType: 'inChannel',
        deleteOriginal: true,
        text: `오늘 점심은 **${menu.name}** 로 정했습니다.`,
        attachments: [
          {
            color: 'blue',
            title: '점심 확정',
            fields: [
              { title: '메뉴', value: menu.name, short: true },
              { title: '카테고리', value: menu.category, short: true }
            ]
          }
        ]
      });
    }

    return res.status(200).json(
      buildDoorayText(
        `처리되지 않은 액션입니다. callbackId=${callbackId}, actionText=${actionText}, actionValue=${actionValue}`
      )
    );
  } catch (error) {
    return res.status(200).json(buildDoorayError('상호작용 처리 중 오류가 발생했습니다.'));
  }
}

async function createLunchItem(req, res) {
  try {
    if (!verifyAppToken(req)) {
      return res.status(401).json(buildDoorayError('유효하지 않은 appToken 입니다.'));
    }

    const rawText = (req.body || {}).text || '';
    const { name, category } = parseLunchNewText(rawText);

    if (!name) {
      return res.status(200).json(
        buildDoorayText('등록 형식: 메뉴명|카테고리  예) 비빔밥|한식')
      );
    }

    const created = lunchService.addLunchItem({ name, category });

    return res.status(200).json(buildDoorayRegisteredMessage(created.name));
  } catch (error) {
    return res.status(200).json(buildDoorayError('메뉴 등록 중 오류가 발생했습니다.'));
  }
}

async function startMbti(req, res) {
  try {
    if (!verifyAppToken(req)) {
      return res.status(401).json(buildDoorayError('유효하지 않은 appToken 입니다.'));
    }

    const responseUrl = (req.body || {}).responseUrl || '';
    const userId = (req.body || {}).userId || 'anonymous';

    if (!responseUrl) {
      return res.status(200).json(buildDoorayError('responseUrl 이 없습니다.'));
    }

    waitUntil(
      sendDelayedMbtiStart({
        responseUrl,
        userId
      })
    );

    return res.status(200).json(
      buildDoorayAccepted('MBTI 검사를 시작합니다. 첫 질문을 보내드릴게요.')
    );
  } catch (error) {
    return res.status(200).json(buildDoorayError('MBTI 시작 중 오류가 발생했습니다.'));
  }
}

async function interactMbti(req, res) {
  try {
    if (!verifyAppToken(req)) {
      return res.status(401).json(buildDoorayError('유효하지 않은 appToken 입니다.'));
    }

    const actionValue = (req.body || {}).actionValue || '';

    if (actionValue === 'mbti-stats') {
      const stats = mbtiService.getStats();
      return res.status(200).json(buildDoorayMbtiStatsMessage(stats));
    }

    if (!actionValue.startsWith('mbti-answer:')) {
      return res.status(200).json(buildDoorayText('알 수 없는 MBTI 액션입니다.'));
    }

    const [, sessionId, selectedCode] = actionValue.split(':');

    mbtiService.answerQuestion(sessionId, selectedCode);

    if (mbtiService.isFinished(sessionId)) {
      const result = mbtiService.calculateResult(sessionId);
      mbtiService.deleteSession(sessionId);

      return res.status(200).json(
        Object.assign(buildDoorayMbtiResultMessage(result), { replaceOriginal: true })
      );
    }

    const session = mbtiService.getSession(sessionId);
    const question = mbtiService.getCurrentQuestion(sessionId);

    return res.status(200).json({
      ...buildDoorayMbtiQuestionMessage({
        sessionId,
        question,
        step: session.currentIndex + 1,
        total: 4
      }),
      replaceOriginal: true
    });
  } catch (error) {
    return res
      .status(200)
      .json(buildDoorayError(error.message || 'MBTI 처리 중 오류가 발생했습니다.'));
  }
}

async function createBlindVote(req, res) {
  try {
    if (!verifyAppToken(req)) {
      return res.status(401).json(buildDoorayError('유효하지 않은 appToken 입니다.'));
    }

    const responseUrl = (req.body || {}).responseUrl || '';
    const creatorId = (req.body || {}).userId || 'anonymous';
    const rawText = (req.body || {}).text || '';

    if (!responseUrl) {
      return res.status(200).json(buildDoorayError('responseUrl 이 없습니다.'));
    }

    if (!rawText) {
      return res.status(200).json(
        buildDoorayText('사용 형식: 질문 | 선택지1 | 선택지2 | 선택지3 | reveal:on')
      );
    }

    waitUntil(
      sendDelayedBlindVoteStart({
        responseUrl,
        creatorId,
        rawText
      })
    );

    return res.status(200).json(
      buildDoorayAccepted('익명 투표를 생성하고 있습니다.')
    );
  } catch (error) {
    return res.status(200).json(buildDoorayError('투표 생성 중 오류가 발생했습니다.'));
  }
}

async function interactBlindVote(req, res) {
  try {
    if (!verifyAppToken(req)) {
      return res.status(401).json(buildDoorayError('유효하지 않은 appToken 입니다.'));
    }

    const actionValue = (req.body || {}).actionValue || '';
    const userId = (req.body || {}).userId || 'anonymous';

    if (actionValue.startsWith('vote:')) {
      const [, pollId, optionId] = actionValue.split(':');
      const poll = blindVoteService.vote({
        pollId,
        userId,
        optionId
      });

      if (poll.revealProgress || poll.closed) {
        const result = blindVoteService.getResults(pollId);
        return res.status(200).json(
          buildDoorayBlindVoteResultMessage(result, {
            responseType: 'ephemeral',
            text: '투표가 반영되었습니다.'
          })
        );
      }

      return res.status(200).json(
        buildDoorayText('익명 투표가 반영되었습니다. 중간 결과는 비공개입니다.')
      );
    }

    if (actionValue.startsWith('vote-result:')) {
      const [, pollId] = actionValue.split(':');
      const result = blindVoteService.getResults(pollId);
      const poll = blindVoteService.getPoll(pollId);

      if (!poll.closed && !poll.revealProgress) {
        return res.status(200).json(
          buildDoorayText('이 투표는 종료 전까지 결과를 공개하지 않도록 설정되어 있습니다.')
        );
      }

      return res.status(200).json(
        buildDoorayBlindVoteResultMessage(result, {
          responseType: 'ephemeral'
        })
      );
    }

    if (actionValue.startsWith('vote-close:')) {
      const [, pollId] = actionValue.split(':');
      blindVoteService.closePoll({ pollId, userId });
      const result = blindVoteService.getResults(pollId);

      return res.status(200).json(
        buildDoorayBlindVoteResultMessage(result, {
          responseType: 'inChannel',
          text: '투표가 종료되었습니다. 최종 결과를 공개합니다.',
          replaceOriginal: true
        })
      );
    }

    return res.status(200).json(buildDoorayText('알 수 없는 투표 액션입니다.'));
  } catch (error) {
    return res
      .status(200)
      .json(buildDoorayError(error.message || '투표 처리 중 오류가 발생했습니다.'));
  }
}

async function notImplemented(req, res) {
  return res.status(200).json(
    buildDoorayText('이 기능은 아직 Express 버전으로 옮기지 않았습니다.')
  );
}

module.exports = {
  startRecommendLunch,
  interactLunch,
  createLunchItem,
  startMbti,
  interactMbti,
  createBlindVote,
  interactBlindVote,
  notImplemented
};
