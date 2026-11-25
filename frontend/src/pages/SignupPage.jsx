import { useReducer, useRef, useState } from "react";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { Link, useNavigate } from "react-router-dom";
import { checkDuplicate } from "../api/user";
import FloatingLabelInput from "../components/common/FloatingLabelInput";
import Logo from "../components/common/Logo";
import { PrimaryButton } from "../components/common/PrimaryButton";
import { POSTCODE_SCRIPT_URL } from "../constants/postcode";
import { useModal } from "../context/ModalContext";
import {
  EMAIL_REGEX,
  NAME_REGEX,
  PASSWORD_REGEX,
  USERID_REGEX,
} from "../util/userUtil";

const API_URL = import.meta.env.VITE_API_URL;

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
  name: "한글 이름을 2~5자로 입력해 주세요.",
  userId: "영문자로 시작하는 영문·숫자 8~16자를 입력해 주세요.",
  password: "영문, 숫자, 특수문자를 포함해 8~15자로 입력해 주세요.",
  passwordConfirm: "비밀번호가 일치하지 않아요.",
  email: "name@example.com 형식으로 입력해 주세요.",
  zipcode: "주소를 다시 검색해 선택해 주세요.",
};

const addressRequired = "우편번호 찾기에서 주소를 선택해 주세요.";
const requiredMessages = {
  name: "이름을 입력해 주세요.",
  userId: "아이디를 입력해 주세요.",
  password: "비밀번호를 입력해 주세요.",
  passwordConfirm: "비밀번호를 한 번 더 입력해 주세요.",
  email: "이메일을 입력해 주세요.",
  zipcode: addressRequired,
  address: addressRequired,
};

const formats = { name: NAME_REGEX, userId: USERID_REGEX, password: PASSWORD_REGEX, email: EMAIL_REGEX, zipcode: /^\d{5}$/ };

function getFieldError(field, state, checkRequired = false) {
  const value = state[field];
  if (!value.trim()) return checkRequired ? requiredMessages[field] ?? "" : "";
  if (field === "passwordConfirm") return value === state.password ? "" : errorMessages[field];
  return formats[field] && !formats[field].test(value) ? errorMessages[field] : "";
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_VALUE":
      return {
        ...state,
        [action.field]: action.value,
        errors: {
          ...state.errors,
          [action.field]: "",
          ...(action.field === "password" ? { passwordConfirm: "" } : {}),
        },
      };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    default:
      return state;
  }
}

export default function SignupPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const { openModal } = useModal();
  const inputRefs = useRef({});
  const open = useDaumPostcodePopup(POSTCODE_SCRIPT_URL);
  const navigate = useNavigate();
  function handleChange({ target: { id, value } }) {
    dispatch({ type: "SET_VALUE", field: id, value });
    setFormError("");
  }

  function handleBlur({ target: { id } }) {
    const error = getFieldError(id, state);
    if (error && !state.errors[id]) {
      dispatch({ type: "SET_ERROR", field: id, error });
    }
  }

  function showFieldErrors(errors) {
    dispatch({ type: "SET_ERRORS", errors });
    const firstError = Object.keys(fieldLabels).find(field => errors[field]);
    inputRefs.current[firstError]?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current) return;
    setFormError("");

    const errors = Object.fromEntries(
      Object.keys(fieldLabels).map(field => [field, getFieldError(field, state, true)])
    );
    if (errors.zipcode) delete errors.address;
    if (Object.values(errors).some(Boolean)) {
      showFieldErrors(errors);
      return;
    }

    dispatch({ type: "SET_ERRORS", errors: {} });
    submitting.current = true;
    setIsSubmitting(true);
    let completed = false;
    try {
      const [idCheck, emailCheck] = await Promise.all([
        checkDuplicate("userId", state.userId),
        checkDuplicate("email", state.email),
      ]);
      const duplicateErrors = {};
      if (idCheck.isDuplicate) duplicateErrors.userId = "이미 사용 중인 아이디예요.";
      if (emailCheck.isDuplicate) duplicateErrors.email = "이미 사용 중인 이메일이에요.";
      if (Object.keys(duplicateErrors).length) {
        showFieldErrors(duplicateErrors);
        return;
      }
      if (idCheck.error || emailCheck.error) {
        setFormError("중복 확인을 완료하지 못했어요. 다시 시도해 주세요.");
        return;
      }

      const response = await fetch(`${API_URL}/api/user/signup`, {
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
      if (!response.ok) throw new Error("Signup failed");
      completed = true;
      openModal("회원가입이 완료되었습니다!");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch {
      setFormError("회원가입을 완료하지 못했어요. 다시 시도해 주세요.");
    } finally {
      if (!completed) {
        submitting.current = false;
        setIsSubmitting(false);
      }
    }
  }

  // 우편번호 찾기
  function handleAddressSearch() {
    setFormError("");
    open({
      onComplete: (data) => {
        if (submitting.current) return;
        dispatch({ type: "SET_VALUE", field: "zipcode", value: data.zonecode });
        dispatch({ type: "SET_VALUE", field: "address", value: data.address });
      },
      onError: () => setFormError("주소 검색을 열 수 없어요. 다시 시도해 주세요."),
    });
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-deep-green px-4 py-6">
      <div className="flex justify-center mb-6">
        <Logo withSubtitle />
      </div>
      <form className="w-full max-w-[466px] rounded-lg border bg-white p-5 sm:p-10" aria-label="회원가입" onSubmit={handleSubmit}>
        {Object.keys(fieldLabels).map((key) => {
          const { label, hasButton, required } = fieldLabels[key];
          if (hasButton) {
            return (
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3" key={key}>
                <FloatingLabelInput
                  id={key}
                  type="text"
                  text={label}
                  required={required}
                  value={state[key]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  readOnly={isSubmitting}
                  error={state.errors[key]}
                  width="w-full"
                  ref={(el) => (inputRefs.current[key] = el)}
                />
                <PrimaryButton
                  text="우편번호 찾기"
                  width="px-3 whitespace-nowrap sm:w-32"
                  onClick={handleAddressSearch}
                  disabled={isSubmitting}
                />
              </div>
            );
          } else {
            return (
              <div key={key}>
                <FloatingLabelInput
                  id={key}
                  type={key.includes("password") ? "password" : "text"}
                  text={required ? label : `${label} (선택)`}
                  required={required}
                  width="w-full"
                  value={state[key]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  readOnly={isSubmitting}
                  error={state.errors[key]}
                  ref={(el) => (inputRefs.current[key] = el)}
                  isPassword={key.includes("password")}
                />
              </div>
            );
          }
        })}
        {formError && <p role="alert" className="mapl-field-error mb-3">{formError}</p>}
        <PrimaryButton text={isSubmitting ? "가입 처리 중" : "회원가입"} width="w-full" type="submit" disabled={isSubmitting} />
        <Link to="/login" className="mapl-button mapl-button-outline flex h-12 w-full items-center justify-center">
          로그인으로 돌아가기
        </Link>
      </form>
    </div>
  );
}
