import { LoginExpiredError } from "../util/error";
import { ERROR_TYPE } from "../util/errorType";

const API_URL = import.meta.env.VITE_API_URL;

// 인증 토큰을 포함하여 API 요청을 보내고, 필요 시 토큰을 갱신하여 재요청합니다.
export async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");
  let response = await fetchWithToken(url, options, accessToken);

  if (response.status !== 401) return response;

  const data = await parseJsonSafely(response);

  if (!isRetryableError(response, data)) return response;

  try {
    const newAccessToken = await refreshAccessToken();
    response = await fetchWithToken(url, options, newAccessToken);
  } catch {
    throw new LoginExpiredError();
  }

  return response;
}

// 주어진 토큰을 Authorization 헤더에 포함하여 fetch 요청을 보냅니다.
function fetchWithToken(url, options, token) {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// 비밀번호 오류가 아닌 경우 토큰 갱신 후 재요청이 가능한지 검사합니다.
function isRetryableError(response, data) {
  return response.status === 401 && data.type !== ERROR_TYPE.INVALID_PASSWORD;
}

// 응답 객체를 JSON으로 안전하게 파싱하며, 실패 시 빈 객체를 반환합니다.
async function parseJsonSafely(response) {
  try {
    return await response.clone().json();
  } catch {
    return {};
  }
}

// 리프레시 토큰을 사용해 새로운 액세스 토큰을 발급받고 로컬스토리지에 저장합니다.
async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_URL}/api/user/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("리프레시 토큰이 유효하지 않습니다.");
    }

    const { accessToken } = await response.json();
    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  } catch (error) {
    console.error("리프레시 토큰 갱신 실패:", error);
    throw new LoginExpiredError();
  }
}
