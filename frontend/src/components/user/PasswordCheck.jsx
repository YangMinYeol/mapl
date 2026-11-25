import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyPassword } from "../../api/user";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { useErrorHandler } from "../../hooks/useErrorHandler";

export function PasswordCheck() {
  const { user } = useContext(UserContext);
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const checking = useRef(false);
  const { openModal } = useModal();
  const handleError = useErrorHandler();
  const navigate = useNavigate();

  const handlePasswordCheck = async (event) => {
    event.preventDefault();
    if (checking.current) return;
    if (!password) {
      openModal("비밀번호를 입력해 주세요.");
      return;
    }
    checking.current = true;
    setIsChecking(true);
    try {
      await verifyPassword(password);
      navigate("/user/profile/edit");
    } catch (error) {
      handleError(error);
    } finally {
      checking.current = false;
      setIsChecking(false);
    }
  };

  return (
    <form className="profile-form profile-check" onSubmit={handlePasswordCheck} aria-busy={isChecking}>
      <section className="profile-check-card">
        <h2>계정 확인</h2>
        <div className="profile-check-fields">
          <label htmlFor="check-id">아이디</label>
          <input id="check-id" className="mapl-input" value={user.userId} readOnly />
          <label htmlFor="current-password">현재 비밀번호</label>
          <input
            id="current-password"
            className="mapl-input"
            type="password"
            autoComplete="current-password"
            value={password}
            readOnly={isChecking}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </section>
      <div className="profile-actions">
        <button className="mapl-button" type="submit" disabled={isChecking}>
          {isChecking ? "확인 중" : "확인"}
        </button>
      </div>
    </form>
  );
}
