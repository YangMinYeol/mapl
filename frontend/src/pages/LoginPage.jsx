import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { waitForLogout } from "../api/auth";
import FloatingLabelInput from "../components/common/FloatingLabelInput";
import Logo from "../components/common/Logo";
import { useModal } from "../context/ModalContext";
import { UserContext } from "../context/UserContext";
import { useErrorHandler } from "../hooks/useErrorHandler";
import "./login.css";

const API_URL = import.meta.env.VITE_API_URL;
const monthFormatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

function MonthlyIndex() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const offset = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();

  return (
    <div className="login-index" aria-hidden="true">
      <div className="login-index-month">{monthFormatter.format(today)}</div>
      <div className="login-index-days">
        {Array.from("일월화수목금토", day => <span key={day}>{day}</span>)}
        {Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} />)}
        {Array.from({ length: days }, (_, index) => {
          const day = index + 1;
          return <span key={day} className={day === today.getDate() ? "login-index-today" : undefined}>{day}</span>;
        })}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const handleError = useErrorHandler();

  if (user && localStorage.getItem("accessToken")) {
    return <Navigate to="/" replace />;
  }

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
      await waitForLogout();
      const response = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        credentials: "include",
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

      navigate("/", { replace: true });
    } catch (error) {
      handleError(error);
    }
  }

  return (
    <main className="login-page">
      <div className="login-book">
        <Logo withSubtitle />
        <MonthlyIndex />
      </div>
      <section className="login-sheet" aria-labelledby="login-title">
        <h1 id="login-title">로그인</h1>
        <form onSubmit={(event) => { event.preventDefault(); handleLogin(); }}>
        <FloatingLabelInput
          id="userId"
          type="text"
          text="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          width="w-full"
        />
        <FloatingLabelInput
          id="password"
          type="password"
          text="비밀번호"
          value={password}
          isPassword={true}
          onChange={(e) => setPassword(e.target.value)}
          width="w-full"
        />
          <button className="mapl-button login-submit" type="submit">로그인</button>
          <Link className="mapl-button mapl-button-outline login-join" to="/signup">회원가입</Link>
        </form>
        <div className="login-social" role="group" aria-label="소셜 로그인">
          <button className="login-kakao" type="button" onClick={() => openModal("카카오 로그인은 준비 중이에요.")}>
            <span className="login-kakao-icon" aria-hidden="true" />카카오 로그인
          </button>
          <button className="login-google" type="button" onClick={() => openModal("Google 로그인은 준비 중이에요.")}>
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_48dp.png" width="18" height="18" alt="" />
            Google로 계속하기
          </button>
        </div>
      </section>
    </main>
  );
}
