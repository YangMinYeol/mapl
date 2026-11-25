import { useContext } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AccountBookCategory from "../components/account-book-category/AccountBookCategory";
import { UserContext } from "../context/UserContext";
import { PasswordCheck } from "../components/user/PasswordCheck";
import UserSidebar from "../components/user/UserSidebar";
import { getSelectedItemByPath } from "../util/userUtil";
import { ProfileEdit } from "../components/user/ProfileEdit";

import "../styles/account-profile.css";

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
            <div className="account-profile account-main account-surface category-report">
              <header className="category-report-heading">
                <div className="category-heading-copy">
                  <h1>회원정보</h1>
                  <p>{pathName.endsWith("/edit") ? "계정 정보와 주소를 확인하고 수정할 수 있어요." : "회원정보를 수정하려면 현재 비밀번호를 입력해 주세요."}</p>
                </div>
              </header>
              <Outlet />
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
