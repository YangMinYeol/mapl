import { useContext } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AccountBookCategory from "../components/account-book-category/AccountBookCategory";
import { UserContext } from "../context/UserContext";
import { PasswordCheck } from "../components/user/PasswordCheck";
import UserSidebar from "../components/user/UserSidebar";
import { getSelectedItemByPath } from "../util/userUtil";
import { ProfileEdit } from "../components/user/ProfileEdit";

export default function UserPage() {
  const pathName = useLocation().pathname;
  const selectedItem = getSelectedItemByPath(pathName);
  const { user } = useContext(UserContext);
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="account-page mx-auto grid w-full max-w-[1200px] items-start gap-3 px-3 py-4 md:grid-cols-[190px_minmax(0,1fr)] md:gap-5 md:px-5 md:py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <UserSidebar selectedItem={selectedItem} />
      <div className="account-content min-w-0">
        <Routes>
          <Route path="accountbook/category" element={<AccountBookCategory />} />
          <Route element={
            <div className="account-profile account-surface w-full overflow-y-auto px-5 text-[#192123]">
              <div className="border-b border-mapl-slate pt-5 pb-3 text-2xl">{selectedItem.label}</div>
              <div className="py-3"><Outlet /></div>
            </div>
          }>
            <Route path="profile" element={<PasswordCheck />} />
            <Route path="profile/edit" element={<ProfileEdit />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}
