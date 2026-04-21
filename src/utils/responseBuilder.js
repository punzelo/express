function buildDoorayText(text, options = {}) {
  return {
    responseType: options.responseType || 'ephemeral',
    text,
    ...(options.replaceOriginal ? { replaceOriginal: true } : {}),
    ...(options.deleteOriginal ? { deleteOriginal: true } : {})
  };
}

function buildDoorayLunchMessage(menu, options = {}) {
  return {
    responseType: options.responseType || 'ephemeral',
    text: options.text || '점심 메뉴를 확인해 주세요.',
    ...(options.replaceOriginal ? { replaceOriginal: true } : {}),
    ...(options.deleteOriginal ? { deleteOriginal: true } : {}),
    attachments: [
      {
        callbackId: `lunch:${menu.id}`,
        color: 'green',
        title: '오늘의 점심 추천',
        text: `${menu.name} 어떠세요?`,
        fields: [
          {
            title: '메뉴',
            value: menu.name,
            short: true
          },
          {
            title: '카테고리',
            value: menu.category || '기타',
            short: true
          }
        ],
        actions: [
          {
            name: 'lunch_retry',
            type: 'button',
            text: '다시 추천',
            value: 'retry',
            style: 'default'
          },
          {
            name: 'lunch_confirm',
            type: 'button',
            text: '이걸로 확정',
            value: `confirm:${menu.id}`,
            style: 'primary'
          }
        ]
      }
    ]
  };
}

function buildDoorayRegisteredMessage(menuName) {
  return {
    responseType: 'ephemeral',
    text: `메뉴가 등록되었습니다: ${menuName}`
  };
}

function buildDoorayError(message) {
  return {
    responseType: 'ephemeral',
    text: `오류: ${message}`
  };
}

module.exports = {
  buildDoorayText,
  buildDoorayLunchMessage,
  buildDoorayRegisteredMessage,
  buildDoorayError
};
