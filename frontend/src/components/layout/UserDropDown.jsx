import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function UserDropDown({ user, handleLogout }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const container = useRef(null);
  const trigger = useRef(null);
  const location = useLocation();
  const isBoardPage = location.pathname === "/board";

  useEffect(() => {
    if (!open) return;
    function closeOutside(event) {
      if (!container.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
    };
  }, [open]);

  const menuItems = [
    { label: "회원정보", to: "/user/profile" },
    { label: "가계부 카테고리", to: "/user/accountbook/category" },
    { label: "로그아웃", to: "/login", onClick: handleLogout },
  ];

  return (
    <nav aria-label="주 메뉴" className="flex min-w-0 items-center gap-2 whitespace-nowrap">
      <div
        ref={container}
        className="relative min-w-0"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            trigger.current?.focus();
          }
        }}
      >
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={() => setOpen((previous) => !previous)}
          className="flex max-w-full cursor-pointer items-center gap-1 rounded-md px-2 py-1 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="truncate">{user.name} 님</span>
          <FontAwesomeIcon icon={faCaretDown} className="shrink-0" aria-hidden="true" />
        </button>
        {open && (
          <div id={menuId} className="absolute right-0 top-full z-50 mt-1 w-32 rounded-[var(--mapl-menu-radius)] border border-[var(--mapl-line)] bg-white p-1 text-sm text-deep-green shadow-md">
            <div className="flex flex-col gap-[4px]">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  replace={Boolean(item.onClick)}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className="rounded-md px-2 py-2 hover:bg-[var(--mapl-hover)] focus-visible:outline-2 focus-visible:outline-[var(--mapl-focus)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Link
        to={isBoardPage ? "/" : "/board"}
        className="shrink-0 rounded-md px-2 py-1 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {isBoardPage ? "달력" : "게시판"}
      </Link>
    </nav>
  );
}
