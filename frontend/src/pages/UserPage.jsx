import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountBookCategory from "../components/account-book-category/AccountBookCategory";
import UserSidebar from "../components/user/UserSidebar";
import { MENU_KEYS, getSelectedItemByPath } from "../util/userUtil";

export default function UserPage() {
  const pathName = useLocation().pathname;
  const navigate = useNavigate();

  const initialItem = getSelectedItemByPath(pathName);
  const [selectedItem, setSelectedItem] = useState(initialItem);

  useEffect(() => {
    const item = getSelectedItemByPath(pathName);
    setSelectedItem(item);
    if (item.to !== pathName) {
      navigate(item.to, { replace: true });
    }
  }, [pathName, navigate]);

  let content;
  switch (selectedItem.key) {
    case MENU_KEYS.PROFILE:
      break;
    case MENU_KEYS.ACCOUNTBOOK_CATEGORY:
      content = <AccountBookCategory />;
      break;
  }

  return (
    <div className="flex min-[900px] h-[900px] justify-center py-10 gap-5">
      <UserSidebar selectedItem={selectedItem} />
      <div
        className="w-[620px] h-fit px-5 rounded-xl"
        style={{
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="py-5 text-2xl border-b border-mapl-slate">
          {selectedItem.label}
        </div>
        <div className="py-5">{content}</div>
      </div>
    </div>
  );
}
