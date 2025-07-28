import { Route, Routes, useLocation } from "react-router-dom";
import AccountBookCategory from "../components/account-book-category/AccountBookCategory";
import { PasswordCheck } from "../components/user/PasswordCheck";
import UserSidebar from "../components/user/UserSidebar";
import { getSelectedItemByPath } from "../util/userUtil";

export default function UserPage() {
  const pathName = useLocation().pathname;
  const selectedItem = getSelectedItemByPath(pathName);

  return (
    <div className="flex min-[900px] h-[900px] justify-center py-10 gap-5">
      <UserSidebar selectedItem={selectedItem} />
      <div
        className="w-[620px] h-fit px-5 rounded-xl"
        style={{
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="pt-5 pb-3 text-2xl border-b border-mapl-slate">
          {selectedItem.label}
        </div>
        <div className="py-3">
          <Routes>
            <Route path="profile" element={<PasswordCheck />} />
            <Route
              path="accountbook/category"
              element={<AccountBookCategory />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}
