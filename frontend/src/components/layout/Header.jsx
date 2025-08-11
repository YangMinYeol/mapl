import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import Logo from "../common/Logo";
import UserDropDown from "./UserDropDown";

export default function Header() {
  const { user, setUser, logout } = useContext(UserContext);

  // 유저 정보 및 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (token && storedUser) {
      setUser(storedUser);
    }
  }, [setUser]);

  return (
    <header className="py-3 bg-deep-green min-w-[910px]">
      <div className="flex justify-between px-8">
        <Logo height="h-12" useWhiteLogo={true} />
        <div className="flex items-center text-white">
          {user ? (
            <UserDropDown user={user} handleLogout={logout} />
          ) : (
            <Link to="/login" className="hover:underline">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
