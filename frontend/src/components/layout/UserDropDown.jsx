import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function UserDropDown({ user, handleLogout }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isBoardPage = location.pathname === "/board";

  const menuItems = [
    { label: "회원정보", to: "/user/profile" },
    { label: "가계부 카테고리", to: "/user/accountbook/category" },
    { label: "로그아웃", to: "/login", onClick: handleLogout },
  ];

  return (
    <div className="flex gap-2">
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <span>
          {user.name} 님
          <FontAwesomeIcon icon={faCaretDown} className="ml-1" />
        </span>
        {open && (
          <div className="absolute right-0 z-50 p-1 text-xs text-black bg-white border border-gray-300 w-30">
            <div className="flex flex-col gap-[4px]">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  onClick={item.onClick}
                  className="h-6 px-2 leading-6 rounded cursor-pointer hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <span className="mx-2">|</span>
      {isBoardPage ? (
        <Link to="/" className="hover:underline">
          달력
        </Link>
      ) : (
        <Link to="/board" className="hover:underline">
          게시판
        </Link>
      )}
    </div>
  );
}
