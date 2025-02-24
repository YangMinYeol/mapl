import { useDaumPostcodePopup } from "react-daum-postcode";
import Logo from "../components/common/Logo";
import FloatingLabelInput from "../components/common/FloatingLabelInput";
import Button from "../components/common/Button";
import { useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertModal from "../components/common/AlertModal";

const baseUrl = process.env.REACT_APP_API_URL;

const fieldLabels = {
  name: { label: "이름", hasButton: false, required: true },
  userId: { label: "아이디", hasButton: false, required: true },
  password: { label: "비밀번호", hasButton: false, required: true },
  passwordConfirm: { label: "비밀번호 확인", hasButton: false, required: true },
  email: { label: "이메일", hasButton: false, required: true },
  zipcode: { label: "우편번호", hasButton: true, required: true },
  address: { label: "주소", hasButton: false, required: true },
  detailAddress: { label: "상세주소", hasButton: false, required: false },
};

const initialState = Object.keys(fieldLabels).reduce(
  (acc, key) => ({ ...acc, [key]: "" }),
  { errors: {} }
);

const errorMessages = {
  name: "이름은 2~5자이며 한글만 입력 가능합니다.",
  userId: "영문자로 시작하는 숫자 포함 8~16자여야 합니다.",
  password: "영문, 숫자, 특수문자를 포함하여 8~15자여야 합니다.",
  passwordConfirm: "비밀번호가 일치하지 않습니다.",
  email: "올바른 이메일 형식이 아닙니다.",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_VALUE":
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: action.error || "" },
      };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    default:
      return state;
  }
}

export default function SignupPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const inputRefs = useRef({});
  const open = useDaumPostcodePopup();
  const navigate = useNavigate();

  function handleChange(e) {
    const { id, value } = e.target;
    let error = validateField(id, value);

    if (id === "password") {
      dispatch({ type: "SET_VALUE", field: id, value, error });
      // 비밀번호 입력 시 비밀번호 확인과 비교하여 에러 처리
      if (state.passwordConfirm) {
        const confirmError =
          value === state.passwordConfirm ? "" : errorMessages.passwordConfirm;
        dispatch({
          type: "SET_ERROR",
          field: "passwordConfirm",
          error: confirmError,
        });
      }
    } else if (id === "passwordConfirm") {
      // 비밀번호 확인이 비어있지 않을 때만 검증
      const confirmError = value
        ? value === state.password
          ? ""
          : errorMessages.passwordConfirm
        : "";
      dispatch({ type: "SET_VALUE", field: id, value, error: confirmError });
    } else {
      dispatch({ type: "SET_VALUE", field: id, value, error });
    }
  }

  // 유효성 검사
  function validateField(key, value) {
    switch (key) {
      case "name":
        return value.length >= 2 &&
          value.length <= 5 &&
          /^[가-힣]+$/.test(value)
          ? ""
          : errorMessages.name;
      case "userId":
        return /^[a-zA-Z][a-z0-9A-Z]{7,15}$/.test(value)
          ? ""
          : errorMessages.userId;
      case "password":
        return /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=.-])(?=.*[0-9]).{8,15}$/.test(
          value
        )
          ? ""
          : errorMessages.password;
      case "passwordConfirm":
        return value === state.password ? "" : errorMessages.passwordConfirm;
      case "email":
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ? ""
          : errorMessages.email;
      default:
        return "";
    }
  }

  // 회원가입
  async function handleSubmit() {
    let message = "";
    for (const key of Object.keys(fieldLabels)) {
      if (key === "errors") continue;
      const value = state[key];
      const error = state.errors[key];
      if ((!value || error) && key !== "detailAddress") {
        message = `${fieldLabels[key].label}을(를) 다시 입력해주세요.`;
        inputRefs.current[key].focus();
        break;
      }
    }
    if (message !== "") {
      setModalMessage(message);
      setModalOpen(true);
      return;
    }

    // 아이디 중복 검사
    const { isDuplicate: isUserIdDuplicate, error: userIdError } =
      await checkDuplicate("userId", state.userId);
    if (isUserIdDuplicate) {
      setModalMessage(userIdError || "이미 사용 중인 아이디입니다.");
      setModalOpen(true);
      inputRefs.current.userId.focus();
      return;
    }

    // 이메일 중복 검사
    const { isDuplicate: isEmailDuplicate, error: emailError } =
      await checkDuplicate("email", state.email);
    if (isEmailDuplicate) {
      setModalMessage(emailError || "이미 사용 중인 이메일입니다.");
      setModalOpen(true);
      inputRefs.current.email.focus();
      return;
    }

    // 아이디 중복확인 도중 에러 처리
    if (emailError || userIdError) {
      setModalMessage("아이디와 이메일 중복 확인 중 문제가 발생하였습니다.");
      setModalOpen(true);
      return;
    }

    // 회원가입
    sendSignupData();
  }

  async function checkDuplicate(field, value) {
    try {
      const response = await fetch(`${baseUrl}/api/user/check-duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ field, value }),
      });

      if (!response.ok) {
        throw new Error(`${field} 확인 도중 에러 발생`);
      }

      const data = await response.json();
      return { isDuplicate: data.isDuplicate, error: null };
    } catch (error) {
      console.error(`${field} 중복 확인 에러: `, error);
      return {
        isDuplicate: null,
        error: `${field} 중복 확인 중 문제가 발생하였습니다.`,
      };
    }
  }

  // 회원가입 요청
  async function sendSignupData() {
    try {
      const response = await fetch(`${baseUrl}/api/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: state.userId,
          name: state.name,
          password: state.password,
          email: state.email,
          zipcode: state.zipcode,
          address: state.address,
          detailAddress: state.detailAddress,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "회원가입 실패");
      }

      setModalMessage("회원가입이 완료되었습니다!");
      setModalOpen(true);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("회원가입 오류:", error);
      setModalMessage("회원가입 도중 문제가 발생하였습니다.");
      setModalOpen(true);
    }
  }

  // 우편번호 찾기
  function handleAddressSearch() {
    open({
      onComplete: (data) => {
        dispatch({ type: "SET_VALUE", field: "zipcode", value: data.zonecode });
        dispatch({ type: "SET_VALUE", field: "address", value: data.address });
      },
      onError: (error) => console.error("Daum Postcode API Error:", error),
    });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-deep-green">
      <div className="flex justify-center mb-6">
        <Logo useWhiteLogo={true} />
      </div>
      <section className="p-10 bg-white border rounded-lg">
        <div className="text-right">
          <span>*필수입력사항</span>
        </div>
        {Object.keys(fieldLabels).map((key) => {
          const { label, hasButton, required } = fieldLabels[key];
          if (hasButton) {
            return (
              <div className={"flex justify-between"} key={key}>
                <FloatingLabelInput
                  id={key}
                  type="text"
                  text={`${label}*`}
                  value={state[key]}
                  onChange={handleChange}
                  error={state.errors[key]}
                  width="w-64"
                  ref={(el) => (inputRefs.current[key] = el)}
                />
                <Button
                  text="우편번호 찾기"
                  width="w-32"
                  onClick={handleAddressSearch}
                />
              </div>
            );
          } else {
            return (
              <div key={key}>
                <FloatingLabelInput
                  id={key}
                  type={key.includes("password") ? "password" : "text"}
                  text={required ? `${label}*` : label}
                  value={state[key]}
                  onChange={handleChange}
                  error={state.errors[key]}
                  ref={(el) => (inputRefs.current[key] = el)}
                  isPassword={key.includes("password")}
                />
              </div>
            );
          }
        })}
        <Button text="회원가입" onClick={handleSubmit} />
        <AlertModal
          isOpen={modalOpen}
          message={modalMessage}
          onClose={() => setModalOpen(false)}
        />
      </section>
    </div>
  );
}
