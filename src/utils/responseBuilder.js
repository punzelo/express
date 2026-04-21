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

function buildDoorayAccepted(text = '요청을 접수했습니다.', options = {}) {
  return {
    responseType: options.responseType || 'ephemeral',
    text,
    ...(options.replaceOriginal ? { replaceOriginal: true } : {}),
    ...(options.deleteOriginal ? { deleteOriginal: true } : {})
  };
}

function buildDoorayMbtiQuestionMessage({ sessionId, question, step, total }) {
  return {
    responseType: 'ephemeral',
    text: `MBTI 질문 ${step}/${total}`,
    attachments: [
      {
        callbackId: `mbti:${sessionId}`,
        color: 'purple',
        title: '간단 MBTI 검사',
        text: question.question,
        actions: [
          {
            name: 'mbti_left',
            type: 'button',
            text: question.left.text,
            value: `mbti-answer:${sessionId}:${question.left.code}`,
            style: 'default'
          },
          {
            name: 'mbti_right',
            type: 'button',
            text: question.right.text,
            value: `mbti-answer:${sessionId}:${question.right.code}`,
            style: 'primary'
          }
        ]
      }
    ]
  };
}

function buildDoorayMbtiResultMessage({ result, counts }) {
  return {
    responseType: 'ephemeral',
    text: `검사가 완료되었습니다. 당신의 결과는 **${result}** 입니다.`,
    attachments: [
      {
        color: 'green',
        title: `MBTI 결과: ${result}`,
        fields: [
          { title: 'E / I', value: `${counts.E} / ${counts.I}`, short: true },
          { title: 'S / N', value: `${counts.S} / ${counts.N}`, short: true },
          { title: 'T / F', value: `${counts.T} / ${counts.F}`, short: true },
          { title: 'J / P', value: `${counts.J} / ${counts.P}`, short: true }
        ],
        actions: [
          {
            name: 'mbti_stats',
            type: 'button',
            text: '전체 통계 보기',
            value: 'mbti-stats',
            style: 'default'
          }
        ]
      }
    ]
  };
}

function buildDoorayMbtiStatsMessage(stats) {
  return {
    responseType: 'ephemeral',
    text: stats.total > 0 ? `누적 검사 수: ${stats.total}` : '아직 통계가 없습니다.',
    attachments: [
      {
        color: 'blue',
        title: 'MBTI 전체 통계',
        text:
          stats.items.length > 0
            ? stats.items.map((item) => `• ${item.type}: ${item.count}명`).join('\n')
            : '아직 결과가 없습니다.'
      }
    ]
  };
}

function buildDoorayBlindVoteMessage(poll, options = {}) {
  return {
    responseType: options.responseType || 'inChannel',
    text: options.text || '익명 투표가 생성되었습니다.',
    ...(options.replaceOriginal ? { replaceOriginal: true } : {}),
    ...(options.deleteOriginal ? { deleteOriginal: true } : {}),
    attachments: [
      {
        callbackId: `blind-vote:${poll.id}`,
        color: 'orange',
        title: '익명 투표',
        text: poll.question,
        actions: [
          ...poll.options.map((item) => ({
            name: `vote_${item.id}`,
            type: 'button',
            text: item.text,
            value: `vote:${poll.id}:${item.id}`,
            style: 'default'
          })),
          {
            name: 'vote_result',
            type: 'button',
            text: '결과 보기',
            value: `vote-result:${poll.id}`,
            style: 'primary'
          },
          {
            name: 'vote_close',
            type: 'button',
            text: '투표 종료',
            value: `vote-close:${poll.id}`,
            style: 'danger'
          }
        ]
      }
    ]
  };
}

function buildDoorayBlindVoteResultMessage(result, options = {}) {
  return {
    responseType: options.responseType || 'ephemeral',
    text: options.text || `투표 결과입니다. 총 ${result.totalVotes}표`,
    ...(options.replaceOriginal ? { replaceOriginal: true } : {}),
    attachments: [
      {
        color: result.closed ? 'blue' : 'gray',
        title: result.closed ? '최종 결과' : '현재 결과',
        text: result.options
          .map((item) => `• ${item.text}: ${item.votes}표 (${item.ratio}%)`)
          .join('\n')
      }
    ]
  };
}

module.exports = {
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
};
