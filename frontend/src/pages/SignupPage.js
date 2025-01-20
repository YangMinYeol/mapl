import { useDaumPostcodePopup } from "react-daum-postcode";
import Logo from "../components/Logo";
import FloatingLabelInput from "../components/FloatingLabelInput";
import Button from "../components/Button";
import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: { value: "", error: "" },
    userId: { value: "", error: "" },
    password: { value: "", error: "" },
    passwordConfirm: { value: "", error: "" },
    email: { value: "", error: "" },
    zipcode: { value: "", error: "" },
    address: { value: "", error: "" },
    addressDetail: { value: "", error: "" },
  });
  const open = useDaumPostcodePopup();

  // 유효성 검사
  function validateField(key, value) {
    let error = "";
    switch (key) {
      case "name":
        if (value.length < 2 || value.length > 5) {
          error = "이름은 2~5자여야 합니다.";
        } else if (!/^[가-힣]+$/.test(value)) {
          error = "이름은 한글만 입력 가능합니다.";
        }
        break;
      case "userId":
        if (!/^[a-zA-Z][a-z0-9A-Z]{7,15}$/g.test(value)) {
          error = "영문자로 시작하는 숫자 포함 8~16자여야 합니다.";
        }
        break;
      case "password":
        if (
          !/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/g.test(value)
        ) {
          error = "영문, 숫자, 특수문자를 포함하여 8~15자여야 합니다.";
        }
        break;
      case "passwordConfirm":
        if (form.password.value !== value) {
          error = "비밀번호가 일치하지 않습니다.";
        }
        break;
      case "email":
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g.test(value)) {
          error = "올바른 이메일 형식이 아닙니다.";
        }
        break;
      default:
        error = "";
        break;
    }
    return error;
  }

  // input 값
  function handleChange(e) {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: {
        value,
        error: validateField(id, value),
      },
    }));
  }

  // 아이디 중복 확인
  function handleIdDuplicateCheck() {}

  // 회원가입
  function handleSubmit() {}

  // 주소 찾기
  function handleAddressSearch() {
    open({
      onComplete: (data) => {
        setForm((prevForm) => ({
          ...prevForm,
          zipcode: { value: data.zonecode, error: "" },
          address: { value: data.address, error: "" },
        }));
      },
      onError: (error) => {
        console.error("Daum Postcode API Error:", error);
      },
    });
  }

  function isFormInvalid() {
    return Object.keys(form).some((field) => {
      const { value, error } = form[field];
      // addressDetail은 선택사항
      if (field === "addressDetail") {
        return false;
      }
      // 다른 필드는 비어있거나 오류가 있으면 유효하지 않음
      return value === "" || error !== "";
    });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <section className="p-10 border">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <FloatingLabelInput
          id="name"
          type="text"
          text="이름"
          value={form.name.value}
          onChange={handleChange}
          error={form.name.error}
        />
        <div className="flex justify-between">
          <FloatingLabelInput
            id="userId"
            type="text"
            text="아이디"
            width="w-72"
            value={form.userId.value}
            onChange={handleChange}
            error={form.userId.error}
          />
          <Button
            text="중복확인"
            width="w-24"
            onClick={handleIdDuplicateCheck}
            isDisabled={form.userId.value === "" || form.userId.error !== ""}
          />
        </div>
        <FloatingLabelInput
          id="password"
          type="password"
          text="비밀번호"
          isPassword={true}
          value={form.password.value}
          onChange={handleChange}
          error={form.password.error}
        />
        <FloatingLabelInput
          id="passwordConfirm"
          type="password"
          text="비밀번호 확인"
          isPassword={true}
          value={form.passwordConfirm.value}
          onChange={handleChange}
          error={form.passwordConfirm.error}
        />
        <FloatingLabelInput
          id="email"
          type="email"
          text="이메일"
          value={form.email.value}
          onChange={handleChange}
          error={form.email.error}
        />
        <div className="flex justify-between">
          <FloatingLabelInput
            id="zipcode"
            type="text"
            text="우편번호"
            value={form.zipcode.value}
            onChange={handleChange}
            error={form.zipcode.error}
            width="w-64"
          />
          <Button
            text="우편번호 찾기"
            width="w-32"
            onClick={handleAddressSearch}
          />
        </div>
        <FloatingLabelInput
          id="address"
          type="text"
          text="주소"
          value={form.address.value}
          onChange={handleChange}
          error={form.address.error}
        />
        <FloatingLabelInput
          id="addressDetail"
          type="text"
          text="상세주소"
          value={form.addressDetail.value}
          onChange={handleChange}
          error={form.addressDetail.error}
        />
        <Button
          text="회원가입"
          onClick={handleSubmit}
          isDisabled={isFormInvalid()}
        />
      </section>
    </div>
  );
}
