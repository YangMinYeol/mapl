import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/common/Logo";
import FloatingLabelInput from "../components/common/FloatingLabelInput";
import Button from "../components/common/Button";
import { UserContext } from "../context/UserContext";

const baseUrl = process.env.REACT_APP_API_URL;

export default function LoginPage({ setModalOpen, setModalMessage }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setModalMessage("이미 로그인 상태입니다.");
        setModalOpen(true);
        setIsAlreadyLoggedIn(true); // 로그인 상태일 때만 true
      }
    }
  }, []);

  // 모달 닫을 때 홈으로 이동할지 여부 결정
  function handleCloseModal() {
    setModalOpen(false);
    if (isAlreadyLoggedIn) {
      navigate("/");
    }
  }

  // 유효성 검사 함수
  const validateInputs = (userId, password) => {
    const regId = /^[a-zA-Z][a-z0-9A-Z]{7,15}$/.test(userId);
    const regPw = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=.-])(?=.*[0-9]).{8,15}$/.test(
      password
    );
    return regId && regPw;
  };

  // 로그인
  async function handleLogin() {
    if (!userId || !password) {
      setModalMessage("아이디와 비밀번호를 입력해 주세요.");
      setModalOpen(true);
      return;
    }

    if (!validateInputs(userId, password)) {
      setModalMessage("아이디 또는 비밀번호를 다시 한번 확인해 주세요.");
      setModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, password }),
      });
      const data = await response.json();

      if (!data.success) {
        setModalMessage("아이디 또는 비밀번호를 다시 한번 확인해 주세요.");
        setModalOpen(true);
        return;
      }

      // 유저 정보를 UserContext에 저장
      setUser(data.user);

      // accessToken을 세션에 저장
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (error) {
      console.error("로그인 요청 중 에러 발생", error);
      setModalMessage("로그인 요청 중 문제가 발생하였습니다.");
      setModalOpen(true);
      return false;
    }
  }

  // Enter키를 이용해 로그인
  function handleEnterKey(e) {
    if (e.keyCode === 13) {
      handleLogin();
    }
  }

  // 회원가입
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
          onKeyUp={(e) => handleEnterKey(e)}
        />
        <FloatingLabelInput
          id="password"
          type="password"
          text="비밀번호"
          value={password}
          isPassword={true}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={(e) => handleEnterKey(e)}
        />
        <div className="flex justify-end my-3">
          <Link to="/test">아이디 찾기</Link>
          <span className="mx-2"> | </span>
          <Link to="/test">비밀번호 찾기</Link>
        </div>
        <div className="flex flex-col">
          <Button text="로그인" onClick={handleLogin} />
          <Button text="회원가입" onClick={handleSignup} isOutline={true} />
        </div>
      </section>
    </div>
  );
}
