import Logo from "../common/Logo";
import { UserContext } from "../../context/UserContext";
import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const { user, setUser } = useContext(UserContext);

  // 유저 정보 및 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (token && storedUser) {
      setUser(storedUser);
    }
  }, [setUser]);

  // 로그아웃
  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <header className="py-3 bg-deep-green">
      <div className="flex justify-between w-full px-8">
        <Logo height="h-12" useWhiteLogo={true} />
        <div className="flex items-center text-white">
          {user ? (
            <div className="flex gap-2">
              <span>{user.name}님</span>
              <Link
                to="/login"
                onClick={handleLogout}
                className="hover:underline"
              >
                로그아웃
              </Link>
            </div>
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
