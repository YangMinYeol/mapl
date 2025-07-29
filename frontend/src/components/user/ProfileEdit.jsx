import { useContext, useState } from "react";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { UserContext } from "../../context/UserContext";
import ColorButton from "../common/ColorButton";

export function ProfileEdit() {
  const { user } = useContext(UserContext);
  const open = useDaumPostcodePopup();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState(user.email);
  const [zipcode, setZipcode] = useState(user.zipcode);
  const [address, setAddress] = useState(user.address);
  const [detailAddress, setDetailAddress] = useState(user.detailAddress);

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
        <ColorButton text="탈퇴하기" onClick />
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
