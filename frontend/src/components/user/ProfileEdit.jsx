import { useContext, useRef, useState } from "react";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { useNavigate } from "react-router-dom";
import { checkDuplicate, deleteAccount, updateProfile } from "../../api/user";
import { POSTCODE_SCRIPT_URL } from "../../constants/postcode";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../../util/userUtil";

export function ProfileEdit() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const open = useDaumPostcodePopup(POSTCODE_SCRIPT_URL);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState(user.email);
  const [zipcode, setZipcode] = useState(user.zipcode);
  const [address, setAddress] = useState(user.address);
  const [detailAddress, setDetailAddress] = useState(user.detailAddress);
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);
  const { openModal, openConfirm } = useModal();
  const handleError = useErrorHandler();

  // 로그아웃
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // 우편번호 찾기
  const handleAddressSearch = () => {
    open({
      onComplete: (data) => {
        if (saving.current) return;
        setZipcode(data.zonecode);
        setAddress(data.address);
      },
      onError: () => openModal("주소 검색을 열 수 없어요. 다시 시도해 주세요."),
    });
  };

  const validateProfileFields = () => {
    const errors = {};

    if (!password) {
      errors.password = "변경할 비밀번호를 입력해 주세요.";
    } else if (!PASSWORD_REGEX.test(password)) {
      errors.password =
        "비밀번호는 영문, 숫자, 특수문자를 포함하여 8~15자여야 합니다.";
    }

    if (!passwordConfirm) {
      errors.passwordConfirm = "변경할 비밀번호를 한 번 더 입력해 주세요.";
    } else if (password !== passwordConfirm) {
      errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    if (!email) {
      errors.email = "이메일을 입력해 주세요.";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "올바른 이메일 형식이 아닙니다.";
    }

    if (!zipcode) {
      errors.zipcode = "우편번호를 입력해 주세요.";
    }

    if (!address) {
      errors.address = "주소를 입력해 주세요.";
    }

    return errors;
  };

  // 회원정보수정
  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    if (saving.current) return;

    const firstError = Object.values(validateProfileFields())[0];
    if (firstError) {
      openModal(firstError);
      return;
    }

    saving.current = true;
    setIsSaving(true);
    let completed = false;
    try {
      if (email !== user.email) {
        const { isDuplicate, error } = await checkDuplicate("email", email);
        if (error) {
          openModal("이메일 중복 확인을 완료하지 못했어요. 다시 시도해 주세요.");
          return;
        }

        if (isDuplicate) {
          openModal("이미 사용 중인 이메일이에요.");
          return;
        }
      }

      await updateProfile({ password, email, zipcode, address, detailAddress });
      completed = true;

      openModal(
        "회원정보를 저장했어요.",
        handleLogout,
        "다시 로그인해 주세요."
      );
    } catch (error) {
      handleError(error);
    } finally {
      if (!completed) {
        saving.current = false;
        setIsSaving(false);
      }
    }
  };

  // 회원 탈퇴
  const handleDeleteAccount = () => {
    openConfirm(
      "정말로 삭제하시겠습니까?",
      "삭제한 계정에 대한 정보는 복구할 수 없습니다. 해당 계정으로 입력한 모든 정보가 삭제됩니다.",
      async () => {
        try {
          await deleteAccount();
          handleLogout();
        } catch (error) {
          handleError(error);
        }
      }
    );
  };

  return (
    <form className="profile-form profile-register" onSubmit={handleProfileUpdate} aria-busy={isSaving}>
      <section className="profile-section">
        <h2>기본 정보</h2>
        <div className="profile-field">
          <label htmlFor="name">이름</label>
          <input
            id="name"
            className="mapl-input"
            value={user.name}
            readOnly
          />
        </div>
        <div className="profile-field">
          <label htmlFor="userId">아이디</label>
          <input
            id="userId"
            className="mapl-input"
            value={user.userId}
            readOnly
          />
        </div>
        <div className="profile-field">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            className="mapl-input"
            value={email ?? ""}
            readOnly={isSaving}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={120}
          />
        </div>
      </section>
      <section className="profile-section">
        <h2>비밀번호</h2>
        <div className="profile-field">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            className="mapl-input"
            type="password"
            autoComplete="new-password"
            value={password}
            readOnly={isSaving}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={15}
          />
        </div>
        <div className="profile-field">
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <input
            id="passwordConfirm"
            className="mapl-input"
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            readOnly={isSaving}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            maxLength={15}
          />
        </div>
      </section>
      <section className="profile-section">
        <h2>주소</h2>
        <div className="profile-field">
          <label htmlFor="zipcode">우편번호</label>
          <div className="profile-address">
          <input
            id="zipcode"
            className="mapl-input"
            value={zipcode ?? ""}
            readOnly={isSaving}
            onChange={(event) => setZipcode(event.target.value)}
            maxLength={5}
          />
            <button className="mapl-button mapl-button-outline" type="button" onClick={handleAddressSearch} disabled={isSaving}>
              주소 검색
            </button>
          </div>
        </div>
        <div className="profile-field">
          <label htmlFor="address">주소</label>
          <input
            id="address"
            className="mapl-input"
            value={address ?? ""}
            readOnly={isSaving}
            onChange={(event) => setAddress(event.target.value)}
            maxLength={120}
          />
        </div>
        <div className="profile-field">
          <label htmlFor="detailAddress">상세주소 (선택)</label>
          <input
            id="detailAddress"
            className="mapl-input"
            value={detailAddress ?? ""}
            readOnly={isSaving}
            onChange={(event) => setDetailAddress(event.target.value)}
            maxLength={120}
          />
        </div>
      </section>
      <div className="profile-actions">
        {user.role !== "admin" && (
          <button className="mapl-button mapl-button-outline profile-withdraw" type="button" onClick={handleDeleteAccount} disabled={isSaving}>
            회원 탈퇴
          </button>
        )}
        <button className="mapl-button" type="submit" disabled={isSaving}>{isSaving ? "저장 중" : "저장"}</button>
      </div>
    </form>
  );
}
