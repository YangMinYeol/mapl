import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FloatingLabelInput from "../components/common/FloatingLabelInput";
import Logo from "../components/common/Logo";
import { useModal } from "../context/ModalContext";
import { UserContext } from "../context/UserContext";
import { PrimaryButton } from "../components/common/PrimaryButton";
import { useErrorHandler } from "../hooks/useErrorHandler";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const handleError = useErrorHandler();

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      openModal("이미 로그인 상태입니다.", () => navigate("/"));
    }
  }, [setUser, navigate]);

  // 유효성 검사 함수
  const validateInputs = (userId, password) => {
    const regId = /^[a-zA-Z][a-z0-9A-Z]{7,15}$/.test(userId);
    const regPw = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=.-])(?=.*[0-9]).{8,15}$/.test(
      password
    );
    return regId && regPw;
  };

  // 로그인 처리 함수
  async function handleLogin() {
    if (!userId || !password) {
      openModal("아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    if (!validateInputs(userId, password)) {
      openModal("아이디 또는 비밀번호를 다시 한번 확인해 주세요.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, password }),
      });

      // 로그인 성공 시 UserContext와 localStorage에 저장
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setUser(data.user);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (error) {
      handleError(error);
    }
  }

  // Enter 키 이벤트 처리
  function handleEnterKey(e) {
    if (e.keyCode === 13) {
      handleLogin();
    }
  }

  // 회원가입 이동
  function handleSignup() {
    navigate("/signup");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-deep-green">
      <div className="flex justify-center mb-6">
        <Logo useWhiteLogo={true} />
      </div>
      <section className="p-10 bg-white border rounded-lg">
        <FloatingLabelInput
          id="userId"
          type="text"
          text="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyUp={handleEnterKey}
        />
        <FloatingLabelInput
          id="password"
          type="password"
          text="비밀번호"
          value={password}
          isPassword={true}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={handleEnterKey}
        />
        <div className="flex justify-end my-3">
          <Link to="/test">아이디 찾기</Link>
          <span className="mx-2"> | </span>
          <Link to="/test">비밀번호 찾기</Link>
        </div>
        <div className="flex flex-col">
          <PrimaryButton text="로그인" onClick={handleLogin} />
          <PrimaryButton
            text="회원가입"
            onClick={handleSignup}
            isOutline={true}
          />
        </div>
      </section>
    </div>
  );
}
