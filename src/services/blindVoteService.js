const polls = new Map();

function parseVoteText(rawText = '') {
  const parts = rawText.split('|').map((v) => v.trim()).filter(Boolean);

  const question = parts[0] || '';
  const metaTokens = parts.filter((v) => v.startsWith('reveal:'));
  const options = parts.slice(1).filter((v) => !v.startsWith('reveal:'));
  const revealToken = metaTokens.find((v) => v.startsWith('reveal:'));

  const revealProgress = revealToken
    ? revealToken.toLowerCase() === 'reveal:on'
    : false;

  return {
    question,
    options,
    revealProgress
  };
}

function createPoll({ creatorId = 'anonymous', question, options, revealProgress = false }) {
  if (!question) throw new Error('투표 질문이 필요합니다.');
  if (!options || options.length < 2) throw new Error('선택지는 최소 2개 이상이어야 합니다.');

  const pollId = `poll_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const poll = {
    id: pollId,
    creatorId,
    question,
    options: options.map((text, index) => ({
      id: index,
      text,
      votes: 0
    })),
    voterMap: new Map(),
    revealProgress,
    closed: false,
    createdAt: Date.now()
  };

  polls.set(pollId, poll);
  return poll;
}

function getPoll(pollId) {
  return polls.get(pollId);
}

function vote({ pollId, userId = 'anonymous', optionId }) {
  const poll = getPoll(pollId);
  if (!poll) throw new Error('투표를 찾을 수 없습니다.');
  if (poll.closed) throw new Error('이미 종료된 투표입니다.');

  const option = poll.options.find((v) => v.id === Number(optionId));
  if (!option) throw new Error('선택지를 찾을 수 없습니다.');

  const previousOptionId = poll.voterMap.get(userId);
  if (previousOptionId !== undefined) {
    const previous = poll.options.find((v) => v.id === previousOptionId);
    if (previous) previous.votes -= 1;
  }

  option.votes += 1;
  poll.voterMap.set(userId, option.id);

  return poll;
}

function closePoll({ pollId, userId }) {
  const poll = getPoll(pollId);
  if (!poll) throw new Error('투표를 찾을 수 없습니다.');
  if (poll.creatorId && userId && poll.creatorId !== userId) {
    throw new Error('투표 종료는 생성자만 할 수 있습니다.');
  }

  poll.closed = true;
  return poll;
}

function getResults(pollId) {
  const poll = getPoll(pollId);
  if (!poll) throw new Error('투표를 찾을 수 없습니다.');

  const totalVotes = poll.options.reduce((sum, item) => sum + item.votes, 0);

  return {
    pollId: poll.id,
    question: poll.question,
    totalVotes,
    revealProgress: poll.revealProgress,
    closed: poll.closed,
    options: poll.options.map((item) => ({
      id: item.id,
      text: item.text,
      votes: item.votes,
      ratio: totalVotes === 0 ? 0 : Math.round((item.votes / totalVotes) * 100)
    }))
  };
}

module.exports = {
  parseVoteText,
  createPoll,
  getPoll,
  vote,
  closePoll,
  getResults
};
