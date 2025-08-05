const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

const SALT_ROUNDS = 10;
const TOKEN_EXPIRATION = "1h";
const REFRESH_TOKEN_EXPIRATION = "1d";
const LOGIN_FAIL_MESSAGE = "아이디 또는 비밀번호를 다시 한번 확인해 주세요.";

// 로그인
async function login(req, res) {
  const { userId, password } = req.body;

  try {
    const result = await userModel.getUserInfo(userId);

    if (result.length === 0) {
      return res.status(401).json({ message: LOGIN_FAIL_MESSAGE });
    }

    const user = result[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: LOGIN_FAIL_MESSAGE });
    }

    const accessToken = jwt.sign(
      { id: user.id, userId: user.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { id: user.id, userId: user.userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // 클라이언트 측에서 쿠키를 읽을 수 없도록
      secure: true, // HTTPS 환경에서만 쿠키 전송
      sameSite: "None", // Cross-site 요청에 대해 쿠키를 전송
      path: "/",
    });

    const { password: userPassword, ...userWithoutPassword } = user;
    return res.status(200).json({ user: userWithoutPassword, accessToken });
  } catch (error) {
    console.error("로그인 오류:", error);
    return res
      .status(500)
      .json({ message: "로그인 중 문제가 발생하였습니다." });
  }
}

// 아이디, 이메일 중복확인
async function checkUserIdOrEmail(req, res) {
  const { field, value } = req.body;
  const queryField = field === "userId" ? "user_id" : field;

  try {
    const result = await userModel.checkUserIdOrEmailExist(queryField, value);
    const count = parseInt(result.rows[0].count, 10);
    return res.status(200).json({ isDuplicate: count > 0 });
  } catch (error) {
    console.error("아이디/이메일 중복 확인 오류:", error);
    return res
      .status(500)
      .json({ message: "아이디/이메일 중복 확인중 문제가 발생하였습니다." });
  }
}

// 회원가입
async function signup(req, res) {
  const { userId, name, password, email, zipcode, address, detailAddress } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await userModel.createUser({
      userId,
      password: hashedPassword,
      name,
      email,
      zipcode,
      address,
      detailAddress,
    });

    return res.status(200).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error("회원가입 오류:", error);
    return res
      .status(500)
      .json({ message: "회원가입중 오류가 발생하였습니다." });
  }
}

// 리프레시 토큰으로 액세스 토큰 재발급
async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    console.log("리프레시 토큰이 없습니다.");
    return res.status(401).json({ message: "리프레시 토큰이 없습니다." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    const isTokenExpired = error.name === "TokenExpiredError";
    const statusCode = isTokenExpired ? 401 : 403;
    const errorMessage = isTokenExpired
      ? "리프레시 토큰이 만료되었습니다."
      : "리프레시 토큰이 유효하지 않습니다.";

    console.error(errorMessage, error);
    return res.status(statusCode).json({ message: errorMessage });
  }
}

// 비밀번호 확인
async function verifyPassword(req, res) {
  const { password } = req.body;
  const userId = req.user.userId;
  try {
    const user = await userModel.getUserInfo(userId);
    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        type: "INVALID_PASSWORD",
        message: "비밀번호를 확인해주세요.",
      });
    }
    return res.status(200).json({ message: "비밀번호 검증이 완료되었습니다." });
  } catch (error) {
    console.error("비밀번호 검증 오류:", error);
    return res
      .status(500)
      .json({ message: "비밀번호 검증중 문제가 발생하였습니다." });
  }
}

// 회원탈퇴
async function deleteAccount(req, res) {
  try {
    const id = req.user.id;
    await userModel.deleteAccount(id);
    return res.status(200).json({ message: "회원탈퇴가 완료되었습니다." });
  } catch (error) {
    console.error("회원탈퇴 오류:", error);
    return res
      .status(500)
      .json({ message: "회원탈퇴중 문제가 발생하였습니다." });
  }
}

// 회원 정보 수정
async function updateProfile(req, res) {
  try {
    const id = req.user.id;
    const { password, email, zipcode, address, detailAddress } = req.body;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await userModel.updateProfile({
      id,
      password: hashedPassword,
      email,
      zipcode,
      address,
      detailAddress,
    });
    return res
      .status(200)
      .json({ message: "회원 정보 수정이 완료되었습니다." });
  } catch (error) {
    console.error("회원 정보 수정 오류:", error);
    return res
      .status(500)
      .json({ message: "회원 정보 수정중 문제가 발생하였습니다." });
  }
}

module.exports = {
  login,
  checkUserIdOrEmail,
  signup,
  refreshToken,
  verifyPassword,
  deleteAccount,
  updateProfile,
};
