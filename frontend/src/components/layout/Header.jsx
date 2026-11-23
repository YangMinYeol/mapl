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
    <header className="bg-deep-green py-3">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-4 px-[clamp(16px,3vw,48px)]">
        <Logo />
        <div className="flex min-w-0 items-center text-white">
          {user ? (
            <UserDropDown user={user} handleLogout={logout} />
          ) : (
            <Link to="/login" className="rounded-md px-2 py-1 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
