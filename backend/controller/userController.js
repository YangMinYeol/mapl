const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

// 상수화
const SALT_ROUNDS = 10;
const TOKEN_EXPIRATION = "1h";
const REFRESH_TOKEN_EXPIRATION = "7d";
const LOGIN_FAIL_MESSAGE = "아이디 또는 비밀번호가 일치하지 않습니다.";
const LOGIN_ERROR_MESSAGE = "로그인 중 문제가 발생하였습니다.";
const INTERNAL_ERROR = "서버 내부 오류가 발생하였습니다.";

// 로그인
async function login(req, res) {
  const { userId, password } = req.body;

  try {
    const result = await userModel.getUserInfo(userId);

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: LOGIN_FAIL_MESSAGE });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: LOGIN_FAIL_MESSAGE });
    }

    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });
    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/",
    });

    const { password: userPassword, ...userWithoutPassword } = user;
    return res
      .status(200)
      .json({ success: true, user: userWithoutPassword, accessToken });
  } catch (error) {
    console.error("로그인 오류:", error);
    return res
      .status(500)
      .json({ success: false, message: LOGIN_ERROR_MESSAGE });
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
    console.error("아이디 중복 확인 오류:", error);
    return res.status(500).json({ success: false, message: INTERNAL_ERROR });
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

    return res
      .status(200)
      .json({ success: true, message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error("회원가입 오류:", error);
    return res.status(500).json({ success: false, message: INTERNAL_ERROR });
  }
}

module.exports = { login, checkUserIdOrEmail, signup };
