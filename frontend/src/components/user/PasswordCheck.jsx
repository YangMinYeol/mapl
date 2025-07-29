import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyPassword } from "../../api/user";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import ColorButton from "../common/ColorButton";

export function PasswordCheck() {
  const { user } = useContext(UserContext);
  const [password, setPassword] = useState("");
  const { openModal } = useModal();
  const handleError = useErrorHandler();
  const navigate = useNavigate();

  const handlePasswordCheck = async () => {
    if (!password) {
      openModal("비밀번호를 확인해주세요.");
      return;
    }
    try {
      await verifyPassword(password);
      navigate("/user/profile/edit");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div>
      <div className="mb-10 text-[#666]">
        회원님의 정보를 안전하게 보호하기 위해 비밀번호를 다시 한번
        확인해주세요.
      </div>
      <div>
        <div className="flex items-center mb-5">
          <div className="w-24">
            <label>아이디</label>
          </div>
          <div className="ml-14">
            <input
              type="text"
              value={user.userId}
              className="w-64 h-12 px-2 ml-2 border rounded border-mapl-slate focus:outline-none"
              readOnly={true}
            />
          </div>
        </div>
        <div className="flex items-center pb-10">
          <div className="w-24">
            <label>비밀번호*</label>
          </div>
          <div className="ml-14">
            <input
              type="password"
              className="w-64 h-12 px-2 ml-2 border rounded border-mapl-slate focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="border-t border-mapl-slate"></div>
        <div className="flex justify-center pt-5 pb-3">
          <ColorButton
            text="확인"
            color="green"
            onClick={handlePasswordCheck}
          />
        </div>
      </div>
    </div>
  );
}
