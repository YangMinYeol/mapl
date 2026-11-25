import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { menuGroups } from "../../constants/menuGroups";
import { UserContext } from "../../context/UserContext";
import useAssetStore from "../../stores/useAssetStore";
import "./asset-summary.css";

function AssetSummary({ userId, asset }) {
  const key = `mapl:asset-hidden:${userId}`;
  const [hidden, setHidden] = useState(() => localStorage.getItem(key) !== "false");
  const toggle = (
    <button type="button" onClick={toggleVisibility} aria-pressed={!hidden}
      aria-label={hidden ? "자산 금액 보기" : "자산 금액 숨기기"}
      className="asset-visibility">
      {hidden ? "보기" : "숨기기"}
    </button>
  );

  function toggleVisibility() {
    localStorage.setItem(key, String(!hidden));
    setHidden(!hidden);
  }

  return (
    <div className="asset-summary grid w-full min-w-0 gap-2 rounded-lg border border-[#dce4df] border-l-[3px] border-l-[#80a491] bg-white px-3 py-2.5 md:px-4 md:py-3">
      <div className="asset-caption flex flex-wrap items-center justify-between gap-x-3 text-xs text-[#53655d]">
        <span className="font-medium">현재 자산</span>
        {toggle}
      </div>
      <div className="asset-value min-h-[1lh] text-sm font-medium tracking-tight text-[#174737] tabular-nums [overflow-wrap:anywhere]">
        {hidden ? <span className="font-semibold tracking-[.18em] text-[#697d72]" aria-hidden="true">····</span> : asset ? (
          <>{Number(asset.balance).toLocaleString("ko-KR")} <span className="text-xs font-medium text-[#53655d]">원</span></>
        ) : "—"}
      </div>
    </div>
  );
}

export default function UserSidebar({ selectedItem }) {
  const { user } = useContext(UserContext);
  const asset = useAssetStore((state) => state.asset);
  const navigate = useNavigate();

  return (
    <aside className="account-surface min-w-0 h-fit">
      <div className="account-identity grid gap-2 rounded-t-xl border-b border-mapl-slate p-3 md:block md:p-5">
        <div className="min-w-0 text-sm font-medium [overflow-wrap:anywhere] md:mb-3">{user.name}님</div>
        <AssetSummary key={user.id} userId={user.id} asset={asset} />
      </div>

      <nav aria-label="계정 메뉴" className="account-menu grid gap-2 px-3 py-3 md:block md:space-y-6 md:px-5 md:py-4">
        {menuGroups.map(({ name, items }) => (
          <div key={name} className="account-menu-group min-w-0">
            <h2 className="mb-1.5 pt-1 text-left text-xs font-medium tracking-wide text-[#49665a]">{name}</h2>
            <div className="min-w-0">
              {items.map((item) => {
                const isCurrentPage = selectedItem?.key === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-current={isCurrentPage ? "page" : undefined}
                    className={`flex max-w-full cursor-pointer items-center rounded-md px-2.5 py-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174737] md:my-1 md:w-full md:px-3 md:py-2.5 ${
                      isCurrentPage
                        ? "bg-[#eef5f1] font-medium text-[#164d39]"
                        : "text-[#4c5852] hover:bg-gray-100"
                    }`}
                    onClick={() => navigate(item.to)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
