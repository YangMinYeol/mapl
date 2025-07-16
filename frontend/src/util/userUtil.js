import { menuGroups } from "../constants/menuGroups";

export const MENU_KEYS = {
  PROFILE: "profile",
  ACCOUNTBOOK_CATEGORY: "accountBookCategory",
};

// 접속 주소를 통해 선택된 아이템 가져오기
export function getSelectedItemByPath(pathName) {
  const fallbackItem = menuGroups[0].items[0];
  return (
    menuGroups
      .flatMap((menu) => menu.items)
      .find((item) => item.to === pathName) || fallbackItem
  );
}
