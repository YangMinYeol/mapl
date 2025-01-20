import Logo from "../components/Logo";
import FloatingLabelInput from "../components/FloatingLabelInput";
import Button from "../components/Button";
import Alert from "../components/Alert";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ visible: false, message: "" });

  function isFormInvalid() {
    return (
      userId.length < 7 ||
      userId.length > 15 ||
      password.length < 7 ||
      password.length > 15
    );
  }

  function handleLogin() {
    // 임시 코드
    if (userId === "testtest" && password === "testtest") {
      setAlert({
        visible: true,
        message: "Ok: 로그인 성공",
      });
    } else {
      setAlert({
        visible: true,
        message: "Fail: 로그인 실패",
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <section className="p-10 border">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        {alert.visible && (
          <Alert
            message={alert.message}
            onClose={() => setAlert({ ...alert, visible: false })}
          />
        )}
        <FloatingLabelInput
          id="userId"
          type="text"
          text="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <FloatingLabelInput
          id="password"
          type="password"
          text="비밀번호"
          value={password}
          isPassword={true}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          text="로그인"
          onClick={handleLogin}
          isDisabled={isFormInvalid()}
        />
        <div className="flex justify-around">
          <Link to="/signup">회원가입</Link>
          <Link to="/#">아이디 찾기</Link>
          <Link to="/#">비밀번호 찾기</Link>
        </div>
      </section>
    </div>
  );
}
