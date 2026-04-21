const lunchService = require('../services/lunchService');
const {
  buildDoorayText,
  buildDoorayLunchMessage,
  buildDoorayRegisteredMessage,
  buildDoorayError
} = require('../utils/responseBuilder');

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

async function notImplemented(req, res) {
  return res.status(200).json(
    buildDoorayText('이 기능은 아직 Express 버전으로 옮기지 않았습니다.')
  );
}

module.exports = {
  startRecommendLunch,
  interactLunch,
  createLunchItem,
  notImplemented
};
