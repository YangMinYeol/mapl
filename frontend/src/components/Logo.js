import { useNavigate } from "react-router-dom";
import LogoImage from "../assets/images/logo.svg";

export default function Logo({ height }) {
  const navigate = useNavigate();

  function navigateToHome() {
    navigate("/");
  }

  return (
    <img
      src={LogoImage}
      alt="Mapl Logo"
      className={`cursor-pointer ${height || "h-auto"}`} // height가 없으면 기본값 제공
      onClick={navigateToHome}
    />
  );
}
