let lunchItems = [
  { id: 1, name: '김치찌개', category: '한식' },
  { id: 2, name: '제육볶음', category: '한식' },
  { id: 3, name: '돈까스', category: '일식' },
  { id: 4, name: '짜장면', category: '중식' },
  { id: 5, name: '파스타', category: '양식' }
];

function pickRandomLunch() {
  if (lunchItems.length === 0) {
    throw new Error('등록된 메뉴가 없습니다.');
  }

  const index = Math.floor(Math.random() * lunchItems.length);
  return lunchItems[index];
}

function addLunchItem({ name, category }) {
  const newItem = {
    id: lunchItems.length ? lunchItems[lunchItems.length - 1].id + 1 : 1,
    name,
    category
  };

  lunchItems.push(newItem);
  return newItem;
}

function getAllLunchItems() {
  return lunchItems;
}

module.exports = {
  pickRandomLunch,
  addLunchItem,
  getAllLunchItems
};
