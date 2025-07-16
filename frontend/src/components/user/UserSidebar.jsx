import { useNavigate } from "react-router-dom";
import { menuGroups } from "../../constants/menuGroups";
import useAssetStore from "../../stores/useAssetStore";

export default function UserSidebar({ user, selectedItem }) {
  const asset = useAssetStore((state) => state.asset);
  const navigate = useNavigate();

  return (
    <div
      className="min-w-[280px] h-fit rounded-xl bg-white"
      style={{
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* 사용자 정보 */}
      <div className="p-5 border-b border-mapl-slate rounded-t-xl">
        <div className="mb-4 text-base font-semibold ">{user.name}님</div>
        <div
          className="p-3 border rounded-lg border-mapl-slate"
          style={{
            boxShadow: "0 0 2px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="mb-1 text-[#666]">자산</div>
          <div className="text-base text-right ">
            {`${Number(asset ? asset.balance : 0).toLocaleString()}원`}
          </div>
        </div>
      </div>

      {/* 메뉴 정보 */}
      <div className="divide-y divide-mapl-slate">
        {menuGroups.map(({ name, items }) => (
          <div key={name} className="p-5">
            <div className="mb-2 text-[#666]">{name}</div>
            {items.map((item) => (
              <button
                key={item.key}
                className={`py-2 cursor-pointer rounded block w-full text-left ${
                  selectedItem?.key === item.key
                    ? "text-green-900 font-semibold"
                    : "hover:text-green-900 hover:font-semibold"
                }`}
                onClick={() => navigate(item.to)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
