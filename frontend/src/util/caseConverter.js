// 객체 - 스네이크 케이스 → 카멜 케이스로 변환
export function convertSnakeToCamel(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    acc[camelKey] = obj[key];
    return acc;
  }, {});
}

// 배열 - 스네이크 케이스 → 카멜 케이스로 변환
export function convertArraySnakeToCamel(arr) {
  return arr.map(convertSnakeToCamel);
}
