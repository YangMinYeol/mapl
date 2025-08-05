import { menuGroups } from "../constants/menuGroups";

/* 정규표현식 */
export const NAME_REGEX = /^[가-힣]{2,5}$/;
export const USERID_REGEX = /^[a-zA-Z][a-z0-9A-Z]{7,15}$/;
export const PASSWORD_REGEX =
  /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=.-])(?=.*[0-9]).{8,15}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 접속 주소를 통해 선택된 아이템 가져오기
export function getSelectedItemByPath(pathName) {
  const fallbackItem = menuGroups[0].items[0];
  return (
    menuGroups
      .flatMap((menu) => menu.items)
      .find((item) => item.to === pathName) || fallbackItem
  );
}
