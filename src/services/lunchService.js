let lunchItems = [
  { id: 1, name: '김치찌개', category: '한식' },
  { id: 2, name: '제육볶음', category: '한식' },
  { id: 3, name: '돈까스', category: '일식' },
  { id: 4, name: '짜장면', category: '중식' },
  { id: 5, name: '파스타', category: '양식' }
];

function pickRandomLunch(filterText = '') {
  let candidates = lunchItems;

  if (filterText && filterText.trim()) {
    const keyword = filterText.trim().toLowerCase();
    candidates = lunchItems.filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
      );
    });
  }

  if (candidates.length === 0) {
    throw new Error('조건에 맞는 메뉴가 없습니다.');
  }

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

function addLunchItem({ name, category }) {
  const newItem = {
    id: lunchItems.length ? lunchItems[lunchItems.length - 1].id + 1 : 1,
    name,
    category: category || '기타'
  };

  lunchItems.push(newItem);
  return newItem;
}

function findById(id) {
  return lunchItems.find((item) => item.id === Number(id));
}

module.exports = {
  pickRandomLunch,
  addLunchItem,
  findById
};
