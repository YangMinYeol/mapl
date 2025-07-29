import { useContext, useState } from "react";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "../../api/user";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { LoginExpiredError } from "../../util/error";
import ColorButton from "../common/ColorButton";

export function ProfileEdit() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const open = useDaumPostcodePopup();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState(user.email);
  const [zipcode, setZipcode] = useState(user.zipcode);
  const [address, setAddress] = useState(user.address);
  const [detailAddress, setDetailAddress] = useState(user.detailAddress);
  const { openModal, openConfirm } = useModal();

  // 우편번호 찾기
  const handleAddressSearch = () => {
    open({
      onComplete: (data) => {
        setZipcode(data.zonecode);
        setAddress(data.address);
      },
      onError: (error) => console.error("Daum Postcode API Error:", error),
    });
  };

  // 회원 탈퇴
  const handleDeleteAccount = () => {
    openConfirm(
      "정말로 삭제하시겠습니까?",
      "삭제한 계정에 대한 정보는 복구할 수 없습니다. 해당 계정으로 입력한 모든 정보가 삭제됩니다.",
      async () => {
        try {
          await deleteAccount();
          // 로그아웃
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          setUser(null);
          navigate("/login");
        } catch (error) {
          if (error instanceof LoginExpiredError) {
            handleLoginExpired(error.message);
          } else {
            console.error("회원 탈퇴 오류:", error);
            openModal(error.message);
          }
        }
      }
    );
  };

  return (
    <div>
      <LabeledInput
        id="name"
        label="이름"
        type="text"
        value={user.name}
        maxLength={15}
        readOnly={true}
      />

      <LabeledInput
        id="userId"
        label="아이디"
        type="text"
        value={user.userId}
        maxLength={15}
        readOnly={true}
      />

      <LabeledInput
        id="password"
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        maxLength={15}
      />

      <LabeledInput
        id="passwordConfirm"
        label="비밀번호 확인"
        type="password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        maxLength={15}
      />

      <LabeledInput
        id="email"
        label="이메일"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        maxLength={120}
      />

      <div className="flex items-center mb-5">
        <div className="w-24">
          <label>우편번호</label>
        </div>
        <div className="ml-14">
          <input
            type="text"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            className="h-12 px-2 ml-2 border rounded outline-none w-72 border-mapl-slate focus:outline-none"
            maxLength={5}
          ></input>
        </div>
        <div>
          <button
            className="h-12 px-2 ml-2 font-semibold text-white rounded bg-deep-green hover:cursor-pointer"
            onClick={handleAddressSearch}
          >
            우편번호 찾기
          </button>
        </div>
      </div>

      <LabeledInput
        id="address"
        label="주소"
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        maxLength={120}
      />

      <LabeledInput
        id="detailAddress"
        label="상세주소"
        type="text"
        value={detailAddress}
        onChange={(e) => setDetailAddress(e.target.value)}
        maxLength={120}
      />

      <div className="border-t border-mapl-slate"></div>
      <div className="flex justify-center pt-5 pb-3">
        <ColorButton text="탈퇴하기" onClick={handleDeleteAccount} />
        <ColorButton text="회원정보수정" color="green" onClick />
      </div>
    </div>
  );
}

function LabeledInput({
  id,
  label,
  type,
  value,
  onChange,
  maxLength,
  readOnly = false,
}) {
  return (
    <div className="flex items-center mb-5">
      <div className="w-24">
        <label htmlFor={id}>{label}</label>
      </div>
      <div className="ml-14">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className="h-12 px-2 ml-2 border rounded outline-none w-72 border-mapl-slate focus:outline-none"
          maxLength={maxLength}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
