function buildTextResponse(text) {
  return {
    ok: true,
    type: 'text',
    text
  };
}

function buildErrorResponse(message) {
  return {
    ok: false,
    type: 'error',
    message
  };
}

function buildLunchCardResponse({ title, description, metadata }) {
  return {
    ok: true,
    type: 'card',
    title,
    description,
    metadata,
    actions: [
      {
        label: '다시 추천',
        action: 'retry'
      },
      {
        label: '확인',
        action: 'confirm'
      }
    ]
  };
}

module.exports = {
  buildTextResponse,
  buildErrorResponse,
  buildLunchCardResponse
};
