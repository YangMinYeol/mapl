import { MENU_KEYS } from "../util/userUtil";

export const menuGroups = [
  {
    name: "내 정보관리",
    items: [{ key: MENU_KEYS.PROFILE, label: "회원정보", to: "/user/profile" }],
  },
  {
    name: "가계부",
    items: [
      {
        key: MENU_KEYS.ACCOUNTBOOK_CATEGORY,
        label: "카테고리",
        to: "/user/accountbook/category",
      },
    ],
  },
];
