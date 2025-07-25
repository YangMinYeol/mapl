import { ERROR_TYPE } from "./errorType";

export class CustomError extends Error {
  constructor(message, type = ERROR_TYPE.GENERAL_ERROR) {
    super(message);
    this.type = type;
    this.name = this.constructor.name;
  }
}

export class LoginExpiredError extends CustomError {
  constructor(message = "로그인이 만료되었습니다. 다시 로그인해 주세요.") {
    super(message, ERROR_TYPE.LOGIN_EXPIRED);
  }
}
