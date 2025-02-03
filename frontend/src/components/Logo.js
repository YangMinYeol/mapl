import { useNavigate } from "react-router-dom";
import LogoImage from "../assets/images/logo.svg";
import LogoWhiteImage from "../assets/images/logo_white.svg";

export default function Logo({ height = "h-auto", useWhiteLogo = false }) {
  const navigate = useNavigate();

  function navigateToHome() {
    navigate("/");
  }

  return (
    <img
      src={useWhiteLogo ? LogoWhiteImage : LogoImage}
      alt="Mapl Logo"
      className={`cursor-pointer ${height}`}
      onClick={navigateToHome}
    />
  );
}
