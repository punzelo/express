const sessions = new Map();
const resultStats = new Map();

const QUESTION_SET = [
  {
    id: 'ei-1',
    dimension: 'EI',
    question: '처음 보는 사람 많은 모임에서 나는?',
    left: { code: 'E', text: '먼저 말을 걸고 분위기를 만든다' },
    right: { code: 'I', text: '상황을 보며 천천히 적응한다' }
  },
  {
    id: 'sn-1',
    dimension: 'SN',
    question: '설명을 들을 때 나는?',
    left: { code: 'S', text: '구체적 예시와 현실적인 방법이 좋다' },
    right: { code: 'N', text: '큰 그림과 아이디어가 더 중요하다' }
  },
  {
    id: 'tf-1',
    dimension: 'TF',
    question: '결정을 할 때 나는?',
    left: { code: 'T', text: '논리와 기준을 우선한다' },
    right: { code: 'F', text: '사람의 감정과 관계를 먼저 본다' }
  },
  {
    id: 'jp-1',
    dimension: 'JP',
    question: '일정을 잡을 때 나는?',
    left: { code: 'J', text: '미리 정리하고 계획대로 가는 편이다' },
    right: { code: 'P', text: '유연하게 상황에 맞춰 바꾸는 편이다' }
  }
];

function createSession(userId = 'anonymous') {
  const sessionId = `mbti_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  sessions.set(sessionId, {
    id: sessionId,
    userId,
    currentIndex: 0,
    answers: [],
    createdAt: Date.now()
  });

  return sessions.get(sessionId);
}

function getSession(sessionId) {
  return sessions.get(sessionId);
}

function getCurrentQuestion(sessionId) {
  const session = getSession(sessionId);
  if (!session) return null;
  return QUESTION_SET[session.currentIndex] || null;
}

function answerQuestion(sessionId, selectedCode) {
  const session = getSession(sessionId);
  if (!session) throw new Error('MBTI 세션을 찾을 수 없습니다.');

  const question = QUESTION_SET[session.currentIndex];
  if (!question) throw new Error('더 이상 질문이 없습니다.');

  session.answers.push({
    questionId: question.id,
    dimension: question.dimension,
    selectedCode
  });
  session.currentIndex += 1;

  return session;
}

function isFinished(sessionId) {
  const session = getSession(sessionId);
  if (!session) return false;
  return session.currentIndex >= QUESTION_SET.length;
}

function calculateResult(sessionId) {
  const session = getSession(sessionId);
  if (!session) throw new Error('MBTI 세션을 찾을 수 없습니다.');

  const counts = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0
  };

  for (const answer of session.answers) {
    counts[answer.selectedCode] += 1;
  }

  const result =
    `${counts.E >= counts.I ? 'E' : 'I'}`
    + `${counts.S >= counts.N ? 'S' : 'N'}`
    + `${counts.T >= counts.F ? 'T' : 'F'}`
    + `${counts.J >= counts.P ? 'J' : 'P'}`;

  resultStats.set(result, (resultStats.get(result) || 0) + 1);

  return {
    result,
    counts,
    totalAnswered: session.answers.length
  };
}

function getStats() {
  const all = Array.from(resultStats.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const total = all.reduce((sum, item) => sum + item.count, 0);

  return {
    total,
    items: all
  };
}

function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

module.exports = {
  createSession,
  getSession,
  getCurrentQuestion,
  answerQuestion,
  isFinished,
  calculateResult,
  getStats,
  deleteSession
};
